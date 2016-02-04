'use strict';

require('mocha');
var minimist = require('minimist');
var assert = require('assert');
var tasks = require('base-tasks');
var Base = require('base');
var argv = require('..');
var base;

describe('base-argv', function() {
  beforeEach(function() {
    base = new Base();
    base.use(argv());
  });

  describe('plugin', function() {
    it('should export a function', function() {
      assert.equal(typeof argv, 'function');
    });
  });

  describe('orig', function() {
    it('should expose an orig object', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert(res.orig);
      assert.equal(typeof res.orig, 'object');
    });

    it('should put the args parsed by minimist on `minimist`', function() {
      var args = ['--set=a:b', 'foo', 'bar'];
      var res = base.argv(args);
      assert.deepEqual(res.minimist, minimist(args));
    });

    it('should emit `argv`', function(cb) {
      var args = ['--set=a:b', 'foo', 'bar'];
      base.on('argv', function(argv) {
        assert.deepEqual(argv.minimist, minimist(args));
        cb();
      });
      
      base.argv(args);
    });
  });

  describe('options', function() {
    it('should return the argv without expanding when options.expand is false', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar'], {expand: false});
      assert.deepEqual(res, {set: 'a:b', _: ['foo', 'bar']});
    });

    it('should support setting expand from argv', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar', '--expand=false']);
      assert.deepEqual(res, {set: 'a:b', _: ['foo', 'bar']});
    });

    it('should sift out options from args', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert(res);
      assert(res.set);
      assert.equal(res.set.a, 'b');
    });

    it('should handle multiple options', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert(res);
      assert(res.set);
      assert.equal(res.set.a, 'b');
      assert(res.get);
      assert.equal(res.get.c, 'd');
      assert.deepEqual(res.tasks, ['foo', 'bar']);
    });

    it('should sift out flags and tasks in any order', function() {
      var res = base.argv(['--set=a:b', 'foo', '--get=c:d', 'bar']);
      assert(res);
      assert(res.set);
      assert.equal(res.set.a, 'b');
      assert(res.get);
      assert.equal(res.get.c, 'd');
      assert.deepEqual(res.tasks, ['foo', 'bar']);
    });

    it('should put non-options on the tasks array', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert(res.tasks);
      assert.deepEqual(res.tasks, ['foo', 'bar']);
    });
  });

  describe('tasks', function() {
    it('should expose a tasks array', function() {
      var res = base.argv(['foo']);
      assert(res.tasks);
      assert(Array.isArray(res.tasks));
    });

    it('should sift out tasks when passed as an array', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert.deepEqual(res.tasks, ['foo', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
    });

    it('should parse options flags with object notation', function() {
      var res = base.argv(['--set=x:y', '--a.b.c=foo:bar']);
      assert.equal(res.set.x, 'y');
      assert.deepEqual(res.a, {b: {c: {foo: 'bar'}}});
    });

    it('should parse options flags that are space-separated', function() {
      var res = base.argv(['--set x:y', '--a.b.c foo:bar']);
      assert.equal(res.set.x, 'y');
      assert.deepEqual(res.a, {b: {c: {foo: 'bar'}}});
    });

    it('should set a default task when no other args are passed', function() {
      var res = base.argv([]);
      assert.deepEqual(res.tasks, ['default']);
    });

    it('should not set a default task when other args are passed', function() {
      var res = base.argv(['--foo']);
      assert.equal(typeof res.tasks, 'undefined');
    });

    it('should set a default task when the `--file` flag is whitelisted', function() {
      var res = base.argv(['--file=foo'], {whitelist: 'file'});
      assert.deepEqual(res.tasks, ['default']);
      assert.equal(res.file, 'foo');
    });

    it('should set a default task when the `--cwd` flag is whitelisted', function() {
      var res = base.argv(['--cwd=foo'], {whitelist: 'cwd'});
      assert.deepEqual(res.tasks, ['default']);
      assert.equal(res.cwd, 'foo');
    });

    it('should not a default task when an arbitrary flag is passed', function() {
      var res = base.argv(['--one=two']);
      assert.equal(typeof res.tasks, 'undefined');
      assert.equal(res.one, 'two');
    });

    it('should set a default task when a whitelisted flag is passed', function() {
      var res = base.argv(['--one=two'], {whitelist: 'one'});
      assert.deepEqual(res.tasks, ['default']);
      assert.equal(res.one, 'two');
    });

    it('should set a default task when multiple whitelisted flags are passed', function() {
      var res = base.argv(['--a=b', '--c=d'], {whitelist: ['a', 'b', 'c']});
      assert.deepEqual(res.tasks, ['default']);
      assert.equal(res.a, 'b');
      assert.equal(res.c, 'd');
    });

    it('should not set a default task when a whitelisted flag is passed and a task is passed', function() {
      var res = base.argv(['--one=two', 'minify'], {whitelist: 'one'});
      assert.deepEqual(res.tasks, ['minify']);
      assert.equal(res.one, 'two');
    });

    it('should add tasks set as an options flag', function() {
      var res = base.argv(['--tasks a,b,c']);
      assert.deepEqual(res.tasks, ['a', 'b', 'c']);
    });

    it('should add comma-separated tasks to the tasks array', function() {
      var res = base.argv(['foo,bar']);
      assert.deepEqual(res.tasks, ['foo,bar']);
    });

    it('should add comma-separated tasks and single word tasks', function() {
      var res = base.argv(['foo', 'a,b,c']);
      assert.deepEqual(res.tasks, ['foo', 'a,b,c']);
    });

    it('should add comma-separated tasks and a generator task', function() {
      assert.deepEqual(base.argv(['foo:bar', 'a,b,c']).tasks, ['foo:bar', 'a,b,c']);
      assert.deepEqual(base.argv(['a,b,c', 'foo:bar']).tasks, ['a,b,c', 'foo:bar']);
    });

    it('should add generators and tasks to tasks array', function() {
      var args = ['foo.xxx:one,two', 'bar.zzz:a,c'];
      var res = base.argv(args);
      assert.deepEqual(res.tasks, args);
    });
  });

  describe('options flags', function() {
    it('should sift our flags and tasks', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res.tasks, ['foo', 'bar']);
    });

    it('should sift out multiple flags and tasks', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res.get, {c: 'd'});
      assert.deepEqual(res.tasks, ['foo', 'bar']);
    });

    it('should parse nested objects', function() {
      var res = base.argv(['--set=a:b', '--foo=one:two', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res.foo, {one: 'two'});
      assert.deepEqual(res.tasks, ['bar']);
    });
  });
});
