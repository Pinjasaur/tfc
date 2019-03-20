// Standard libraries
const {
  readFileSync
} = require('fs')

// NPM packages
const fetch = require('node-fetch')

// Utils
const trimAndUnique = arr => arr.map(i => i.trim()).filter(i => i !== "").filter((x, i, a) => a.indexOf(x) === i)
const stats = { total: 0, robots: 0, humans: 0, security: 0 }
const updateStats = async res => {
  if (!res.ok) return
  const text = await res.text().catch(err => err)
  if (/^<!doctype html/i.test(text.trim())) return
  stats.total++
  if (res.url.endsWith('robots.txt'))   stats.robots++
  if (res.url.endsWith('humans.txt'))   stats.humans++
  if (res.url.endsWith('security.txt')) stats.security++
  return res.text().catch(err => err)
}

let urls = []
const files = ['/robots.txt', '/humans.txt', '/.well-known/security.txt']
const domains = trimAndUnique(readFileSync('domains.txt').toString().split('\n'))

console.log(`Crawling ${domains.length} domain(s) (total of ${domains.length * files.length} request(s))...`)

for (const domain of domains) {
  for (const file of files) {
    urls.push(`http://${domain}${file}`)
  }
}

Promise
  .all(urls.map(url =>
    fetch(url)
      .then(updateStats)
      .catch(err => err)
  ))
  .then(res => {
    console.log(stats)
    console.log(`\nStats:\n`)
    console.log(`robots.txt:\t${(stats.robots / domains.length).toFixed(2) * 100}% (${stats.robots} of ${domains.length})`)
    console.log(`humans.txt:\t${(stats.humans / domains.length).toFixed(2) * 100}% (${stats.humans} of ${domains.length})`)
    console.log(`security.txt:\t${(stats.security / domains.length).toFixed(2) * 100}% (${stats.security} of ${domains.length})`)
  })
  .catch(err => console.log(err))
