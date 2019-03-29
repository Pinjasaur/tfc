# text file crawler (tfc)

To quench my curiousity, I wanted to gauge the usage & adoption of the following
pseudo-standard text files:

- [`robots.txt`][robots]
- [`humans.txt`][humans]
- [`.well-known/security.txt`][security]

Given a domains.txt file containing one domain per line, the Node.js script will
fire off requests for each of the files. Given network I/O is the constraint,
this can take a while.

Redirects are capped at 20 and validity is based off the HTTP status code,
Content-Type, and first few values of the response data. After completing, the
statistics will be printed out. Valid text files found will be written to
`files/`, which is created & wiped for you each time the script is started.

## Usage

Make a domains.txt by making your own or symlinking one of the provided:

```
ln -s domains-faang.txt domains.txt
```

Then, grab the dependencies & start it up:

```
npm install && npm start
```

Not all requests receive a response & hang indefinitely. If it's been a while,
just <kbd>Ctrl + C</kbd> the process, which will print out the stats before
exiting.

## Thanks

[David][david].

## License

[MIT][license].


[robots]: http://www.robotstxt.org/
[humans]: http://humanstxt.org/
[security]: https://securitytxt.org/
[david]: https://github.com/davidmerfield
[license]: https://pinjasaur.mit-license.org/@2019
