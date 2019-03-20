// Standard libraries
const {
  readFileSync
} = require('fs')

// NPM packages
const fetch = require('node-fetch')

// Utils
const trimAndUnique = arr => arr.map(i => i.trim()).filter(i => i !== "").filter((x, i, a) => a.indexOf(x) === i)
const noop = () => {}
const stats = { total: 0, robots: 0, humans: 0, security: 0 }
const updateStats = async res => {
  if (!res.ok) return
  // if (/^<!doctype html/i.test(res.))
  const text = await res.text()
  if (/^<!doctype html/i.test(text)) return
  // console.log(text.trim().slice(0,10))
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

// fetch(url)
//   .then(res => res.text())
//   .catch(err => console.log(err))
//   .then(res => updateStats(url))

Promise
  .all(urls.map(url =>
    fetch(url)
      .then(updateStats)
      // .then(res => console.log(res.statusText))
      // .then(res => res.ok ? res.text().catch(err => err) : new Error())
      // .then(res => {
      //   // console.log(`***\n\n\n${url}\n\n\n***`)
      //   // console.log(res.slice(0,100))

      //   updateStats(url)
      // })
      .catch(err => err)
  ))
  // .then(res => Promise.all(
  //   res.map(r => r instanceof Error ? r : r.text().catch(err => err))
  // ))
  .then(res => {
    // console.log(res)
    console.log(stats)
  })
  .catch(err => console.log(err))


