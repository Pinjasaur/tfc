// Standard libraries
const {
  readFileSync,
  writeFile
} = require('fs')

// NPM packages
const axios = require('axios')
const parse = require('url-parse')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

// Utils
const noop = () => {}
const trimAndUnique = arr => arr.map(i => i.trim()).filter(i => i !== "").filter((x, i, a) => a.indexOf(x) === i)
const go = res => {
  stats.total++
  // Content type a text file?
  if (!res.headers['content-type'].toLowerCase().includes('text/plain')) return

  // Probably not an HTML document?
  if (/^<!doctype html/i.test(res.data.trim())) return

  const url  = res.request.res.responseUrl
  const path = parse(url).pathname.toLowerCase()
  const host = parse(url).hostname.toLowerCase()
  const file = res.data

  if (path.endsWith('robots.txt'))   { stats.robots++;   write(host, 'robots',   file) }
  if (path.endsWith('humans.txt'))   { stats.humans++;   write(host, 'humans',   file) }
  if (path.endsWith('security.txt')) { stats.security++; write(host, 'security', file) }

  return res
}
const done = results => {
  clearInterval(update)
  console.log(`Done (${stats.total} responses).\n`)
  console.log(`robots.txt:\t${(stats.robots / domains.length).toFixed(4) * 100}% (${stats.robots} of ${domains.length})`)
  console.log(`humans.txt:\t${(stats.humans / domains.length).toFixed(4) * 100}% (${stats.humans} of ${domains.length})`)
  console.log(`security.txt:\t${(stats.security / domains.length).toFixed(4) * 100}% (${stats.security} of ${domains.length})`)
}
const write = (domain, file, data) => writeFile(`files/${domain}_${file}.txt`, data, (err) => err ? console.log(err) : noop())

process.on('SIGINT', () => {
  done()
  process.exit()
})

rimraf.sync('files')
mkdirp.sync('files')

const stats = { total: 0, robots: 0, humans: 0, security: 0 }
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

const opts = {
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:66.0) Gecko/20100101 Firefox/66.0' },
  maxRedirects: 20,
  // timeout: 5 * 60 * 1000
  // timeout: ((domains.length * 3) / 10) * 1000
}

let update = setInterval(() => console.log(`${stats.total} responses...`), 5 * 1000)

axios
  .all(urls.map(url =>
    axios(url, opts)
      .then(go)
      .catch(err => { stats.total++; return err })
  ))
  .then(axios.spread(done))
