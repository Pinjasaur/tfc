# text file crawler (tfc)

To quench my curiousity, I wanted to gauge the usage & adoption of the following
pseudo-standard text files:

- [`/robots.txt`][robots]
- [`/humans.txt`][humans]
- [`/.well-known/security.txt`][security]

Given a [`domains.txt`](/domains.txt) file containing one domain per line, the
Node.js script will fire off requests for each of the files. Given network I/O
is the constraint, this can take a while. Redirects are capped at 20 and a
request times out after 60 seconds. After completing, the statistics will be
printed out.

## Usage

```
npm install && npm start
```

## Thanks

[David][david].

## License

[MIT][license].


[robots]: http://www.robotstxt.org/
[humans]: http://humanstxt.org/
[security]: https://securitytxt.org/
[david]: https://github.com/davidmerfield
[license]: https://pinjasaur.mit-license.org/@2019
