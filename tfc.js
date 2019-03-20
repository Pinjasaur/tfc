// Standard libraries
const {
  readFileSync
} = require('fs')

// NPM packages
const fetch = require('node-fetch')
const parse = require('url-parse')

// Utils
const trimAndUnique = arr => arr.map(i => i.trim()).filter(i => i !== "").filter((x, i, a) => a.indexOf(x) === i)
const stats = { total: 0, robots: 0, humans: 0, security: 0 }
const go = async res => {

  // HTTP status good?
  if (!res.ok) {
    console.log(`Crawling ${res.url}... NOT OK (${res.status})`)
    return
  }

  // Content type a text file?
  if (!res.headers.get('content-type').toLowerCase().includes('text/plain')) {
    console.log(`Crawling ${res.url}... NOT OK (${res.status})`)
    return
  }

  // Probably not an HTML document?
  const text = await res.text().catch(err => err)
  if (/^<!doctype html/i.test(text.trim())) {
    console.log(`Crawling ${res.url}... NOT OK (${res.status})`)
    return
  }

  console.log(`Crawling ${res.url}... OK (${res.status})`)
  const path = parse(res.url).pathname.toLowerCase()

  stats.total++
  if (path.endsWith('robots.txt'))   stats.robots++
  if (path.endsWith('humans.txt'))   stats.humans++
  if (path.endsWith('security.txt')) stats.security++

  return res.text().catch(err => err)
}

const files = ['/robots.txt', '/humans.txt', '/.well-known/security.txt']
const domains = trimAndUnique(readFileSync('domains.txt').toString().split('\n'))

const urls = files.reduce((acc, file) => acc.concat(domains.map(domain => `http://${domain}${file}`)), [])

/**
  The above code is functionally equivalent to:

  for (const domain of domains) {
    for (const file of files) {
      urls.push(`http://${domain}${file}`)
    }
  }
*/

console.log(`Crawling ${domains.length} domain(s) (total of ${domains.length * files.length} request(s))...`)

Promise
  .all(urls.map(url =>
    fetch(url)
      .then(go)
      .catch(err => err)
  ))
  .then(res => {
    console.log(`Done.\n`)
    console.log(`robots.txt:\t${(stats.robots / domains.length).toFixed(2) * 100}% (${stats.robots} of ${domains.length})`)
    console.log(`humans.txt:\t${(stats.humans / domains.length).toFixed(2) * 100}% (${stats.humans} of ${domains.length})`)
    console.log(`security.txt:\t${(stats.security / domains.length).toFixed(2) * 100}% (${stats.security} of ${domains.length})`)
  })
  .catch(err => console.log(err))
