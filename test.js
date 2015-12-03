'use strict';

require('mocha');
var minimist = require('minimist');
var Base = require('base-methods');
var config = require('base-config');
var tasks = require('base-tasks');
var assert = require('assert');
var plugin = require('./');
var base;

describe('base-argv', function() {
  it('should export a function', function() {
    assert.equal(typeof plugin, 'function');
  });
});

describe('orig', function() {
  it('should expose an orig object', function() {
    var res = plugin.processArgv()(['--set=a:b', 'foo', 'bar']);
    assert(res.orig);
    assert.equal(typeof res.orig, 'object');
  });

  it('should put the args parsed by minimist on orig', function() {
    var args = ['--set=a:b', 'foo', 'bar'];
    var res = plugin.processArgv()(args);
    assert.deepEqual(res.orig, minimist(args));
  });
});

describe('options', function() {
  it('should sift out options from args', function() {
    var res = plugin.processArgv()(['--set=a:b', 'foo', 'bar']);
    assert(res.options);
    assert(res.options.set);
    assert.equal(res.options.set.a, 'b');
  });

  it('should handle multiple options', function() {
    var res = plugin.processArgv()(['--set=a:b', '--get=c:d', 'foo', 'bar']);
    assert(res.options);
    assert(res.options.set);
    assert.equal(res.options.set.a, 'b');
    assert(res.options.get);
    assert.equal(res.options.get.c, 'd');
  });

  it('should put non-options on the _ array', function() {
    var res = plugin.processArgv()(['--set=a:b', '--get=c:d', 'foo', 'bar']);
    assert(res._);
    assert.deepEqual(res._, ['foo', 'bar']);
  });
});

describe('tasks', function() {
  it('should expose a tasks array', function() {
    var res = plugin.processArgv()(['foo']);
    assert(res.tasks);
    assert(Array.isArray(res.tasks));
  });

  it('should sift out tasks when passed as an array', function() {
    var opts = {tasks: ['foo', 'bar']};
    var res = plugin.processArgv(opts)(['--set=a:b', 'foo', 'bar']);
    assert.deepEqual(res.tasks, ['foo', 'bar']);
  });

  it('should sift out tasks when passed as an object', function() {
    var opts = {tasks: {foo: {}, bar: {}}};
    var res = plugin.processArgv(opts)(['--set=a:b', 'foo', 'bar']);
    assert.deepEqual(res.tasks, ['foo', 'bar']);
  });

  it('should split comma-separated tasks into an array', function() {
    var opts = {tasks: {foo: {}, bar: {}}};
    var res = plugin.processArgv(opts)(['foo,bar']);
    assert.deepEqual(res.tasks, ['foo', 'bar']);
  });

  it('should split comma-separated tasks followed by a string into an array', function() {
    var opts = {};
    var res = plugin.processArgv(opts)(['foo', 'a,b,c']);
    assert.deepEqual(res.tasks, ['a', 'b', 'c']);
  });

  it('should split comma-separated tasks followed by an option into an array', function() {
    var opts = {};
    var res = plugin.processArgv(opts)(['foo:bar', 'a,b,c']);
    assert.deepEqual(res.tasks, ['a', 'b', 'c']);
  });
});

describe('prop', function() {
  it('should expose an object for the given `prop`', function() {
    var res = plugin.processArgv({prop: 'generators'})(['foo']);
    assert(res.generators);
    assert(Array.isArray(res.generators));
  });

  it('should create "default" tasks for `prop` passed as single args', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {},
        bar: {}
      }
    };

    var res = plugin.processArgv(config)(['foo', 'bar']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['default']},
     {bar: ['default']}
    ]);
  });

  it('should create a default task when the tasks array is empty', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: []
        },
        bar: {
          tasks: []
        }
      }
    };

    var res = plugin.processArgv(config)(['foo', 'bar']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['default']},
     {bar: ['default']}
    ]);
  });

  it('should create a prop with the default task when defined', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: ['default']
        },
        bar: {
          tasks: ['default', 'a', 'b', 'c']
        }
      }
    };

    var res = plugin.processArgv(config)(['foo', 'bar']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['default']},
     {bar: ['default']}
    ]);
  });

  it('should create a prop with other tasks when default is not defined', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: ['default']
        },
        bar: {
          tasks: ['a', 'b', 'c']
        }
      }
    };

    var res = plugin.processArgv(config)(['foo', 'bar']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['default']},
     {bar: ['a', 'b', 'c']}
    ]);
  });

  it('should split colon separated generators into generators and tasks', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: ['default', 'one']
        },
        bar: {
          tasks: ['a', 'b', 'c']
        }
      }
    };

    var res = plugin.processArgv(config)(['foo:one', 'bar:c']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['one']},
     {bar: ['c']}
    ]);
  });

  it('should split comma separated tasks into an array', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: ['default', 'one', 'two']
        },
        bar: {
          tasks: ['a', 'b', 'c']
        }
      }
    };

    var res = plugin.processArgv(config)(['foo:one,two', 'bar:a,c']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {foo: ['one', 'two']},
     {bar: ['a', 'c']}
    ]);
  });

  it('should not expand dot-separated that match generators', function() {
    var config = {
      prop: 'generators',
      generators: {
        foo: {
          tasks: ['default', 'one', 'two']
        },
        bar: {
          tasks: ['a', 'b', 'c']
        }
      }
    };

    var res = plugin.processArgv(config)(['foo.xxx:one,two', 'bar.zzz:a,c']);
    assert(res.generators);
    assert.deepEqual(res.generators, [
     {'foo.xxx': ['one', 'two']},
     {'bar.zzz': ['a', 'c']}
    ]);
  });
});

describe('commands', function() {
  it('should sift out commands from args', function() {
    var opts = {commands: ['set', 'get']};
    var res = plugin.processArgv(opts)(['--set=a:b', 'foo', 'bar']);
    assert(res.commands);
    assert(res.commands.set);
    assert.equal(res.commands.set.a, 'b');
  });

  it('should sift out multiple commands from args', function() {
    var opts = {commands: ['set', 'get']};
    var res = plugin.processArgv(opts)(['--set=a:b', '--get=c:d', 'foo', 'bar']);

    assert(res.commands.set);
    assert.equal(res.commands.set.a, 'b');

    assert(res.commands.get);
    assert.equal(res.commands.get.c, 'd');
  });

  it('should sift out commands from options', function() {
    var opts = {commands: ['set', 'get']};
    var res = plugin.processArgv(opts)(['--set=a:b', '--foo=one:two', 'bar']);

    assert(res.commands.set);
    assert.equal(res.commands.set.a, 'b');

    assert(res.options.foo);
    assert.equal(res.options.foo.one, 'two');
  });
});


describe('base-methods', function() {
  beforeEach(function() {
    base = new Base();
    base.use(tasks());
    base.use(config());
    base.use(plugin());
  });

  it('should work as a base-methods plugin', function() {
    var res = base.argv(['--set=a:b', 'foo', 'bar']);
    assert(res.orig);
    assert.equal(typeof res.orig, 'object');
  });

  it('should put the args parsed by minimist on argv', function() {
    var args = ['--set=a:b', 'foo', 'bar'];
    var res = base.argv(args);
    assert.deepEqual(res.orig, minimist(args));
  });

  it('should automatically detect commands from base-config and base-cli', function() {
    var args = ['--set=a:b', 'foo', 'bar'];
    var res = base.argv(args);
    assert.deepEqual(res.commands, {set: {a: 'b'}});
  });

  it('should automatically use task keys', function() {
    var args = ['foo', 'bar', 'baz'];
    base.task('foo', function() {});
    base.task('baz', function() {});

    var res = base.argv(args);
    assert.deepEqual(res.tasks, ['foo', 'baz']);
    assert.deepEqual(res._, ['bar']);
  });
});
