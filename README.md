# base-argv [![NPM version](https://badge.fury.io/js/base-argv.svg)](http://badge.fury.io/js/base-argv)  [![Build Status](https://travis-ci.org/jonschlinkert/base-argv.svg)](https://travis-ci.org/jonschlinkert/base-argv)

> Plugin for base-methods that simplifies mapping argv arguments to tasks, commands, and options

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i base-argv --save
```

## Usage

```js
var Base = require('base-methods');
var tasks = require('base-tasks');
var argv = require('base-argv');
var cli = require('base-cli');

var app = new Base();
// register plugins 
app.use(cli());
app.use(tasks());
app.use(argv());

app.task('foo', function() {
  // run gulp plugins or something
});

// parse argv
var args = app.argv(['foo', 'bar', '--set=a:b']);

// if `base-cli` plugin is registered too, this
// will automatically map the resulting object to
// application methods
app.cli.process(args);
```

Results in:

```js
{ argv: { _: [ 'foo', 'bar' ], set: 'a:b' },
  _: [ 'bar' ],
  tasks: ['foo'],
  commands: { set: { a: 'b' } },
  options: {} }
```

## Related projects

* [base-cli](https://www.npmjs.com/package/base-cli): Plugin for base-methods that maps built-in methods to CLI args (also supports methods from a… [more](https://www.npmjs.com/package/base-cli) | [homepage](https://github.com/jonschlinkert/base-cli)
* [base-config](https://www.npmjs.com/package/base-config): base-methods plugin that adds a `config` method for mapping declarative configuration values to other 'base'… [more](https://www.npmjs.com/package/base-config) | [homepage](https://github.com/jonschlinkert/base-config)
* [base-methods](https://www.npmjs.com/package/base-methods): Starter for creating a node.js application with a handful of common methods, like `set`, `get`,… [more](https://www.npmjs.com/package/base-methods) | [homepage](https://github.com/jonschlinkert/base-methods)
* [base-options](https://www.npmjs.com/package/base-options): Adds a few options methods to base-methods, like `option`, `enable` and `disable`. See the readme… [more](https://www.npmjs.com/package/base-options) | [homepage](https://github.com/jonschlinkert/base-options)
* [base-plugins](https://www.npmjs.com/package/base-plugins): Upgrade's plugin support in base-methods to allow plugins to be called any time after init. | [homepage](https://github.com/jonschlinkert/base-plugins)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/base-argv/issues/new).

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2015 Jon Schlinkert
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on November 29, 2015._