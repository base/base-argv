'use strict';

require('mocha');
var assert = require('assert');
var minimist = require('minimist');
var tasks = require('base-task');
var Base = require('base');
var argv = require('..');
var base;

describe('base-argv', function() {
  beforeEach(function() {
    base = new Base();
    base.isApp = true;
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

    it('should emit `argv`', function(cb) {
      var args = ['--set=a:b', 'foo', 'bar'];
      base.on('argv', function(argv) {
        assert.deepEqual(argv._, ['foo', 'bar']);
        assert.deepEqual(argv.set, {a: 'b'});
        cb();
      });

      base.argv(args);
    });
  });

  describe('options', function() {
    it('should return argv without expanding when options.expand is false', function() {
      var args = ['--set=a:b', 'foo', 'bar'];
      var res = base.argv(args, {expand: false});
      assert.deepEqual(res, args);
    });

    it('should handle multiple options', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert(res);
      assert(res.set);
      assert.equal(res.set.a, 'b');
      assert(res.get);
      assert.equal(res.get.c, 'd');
      assert.deepEqual(res._, ['foo', 'bar']);
    });

    it('should sift out flags and tasks in any order', function() {
      var res = base.argv(['--set=a:b', 'foo', '--get=c:d', 'bar']);
      assert(res);
      assert(res.set);
      assert.equal(res.set.a, 'b');
      assert(res.get);
      assert.equal(res.get.c, 'd');
      assert.deepEqual(res._, ['foo', 'bar']);
    });

    it('should put non-options on the tasks array', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert(res._);
      assert.deepEqual(res._, ['foo', 'bar']);
    });
  });

  describe('tasks', function() {
    it('should not modify splat array', function() {
      var res = base.argv(['foo']);
      assert.deepEqual(res._, ['foo']);
    });

    it('should sift out splat array', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert.deepEqual(res._, ['foo', 'bar']);
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

    it('should split comma-separated property values', function() {
      var res = base.argv(['--tasks a,b,c']);
      assert.deepEqual(res.tasks, ['a', 'b', 'c']);
    });

    it('should add comma-separated values to the splat array', function() {
      var res = base.argv(['foo,bar']);
      assert.deepEqual(res._, ['foo', 'bar']);
    });

    it('should add mixed comma-separated values to the splat array', function() {
      var one = base.argv(['foo:bar', 'a,b,c']);
      var two = base.argv(['a,b,c', 'foo:bar']);
      var three = base.argv(['foo', 'a,b,c']);
      assert.deepEqual(one.foo, 'bar');
      assert.deepEqual(one._, ['a', 'b', 'c']);
      assert.deepEqual(two.foo, 'bar');
      assert.deepEqual(two._, ['a', 'b', 'c']);
      assert.deepEqual(three.foo, true);
      assert.deepEqual(three._, ['a', 'b', 'c']);
      var args = ['foo.xxx:one,two', 'bar.zzz:a,c'];
      var res = base.argv(args);
      assert.deepEqual(res, { foo: { xxx: [ 'one', 'two' ] }, bar: { zzz: [ 'a', 'c' ] } });
    });
  });

  describe('options flags', function() {
    it('should sift our flags and tasks', function() {
      var res = base.argv(['--set=a:b', 'foo', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res._, ['foo', 'bar']);
    });

    it('should sift out multiple flags and tasks', function() {
      var res = base.argv(['--set=a:b', '--get=c:d', 'foo', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res.get, {c: 'd'});
      assert.deepEqual(res._, ['foo', 'bar']);
    });

    it('should parse nested objects', function() {
      var res = base.argv(['--set=a:b', '--foo=one:two', 'bar']);
      assert.deepEqual(res.set, {a: 'b'});
      assert.deepEqual(res.foo, {one: 'two'});
      assert.deepEqual(res._, ['bar']);
    });
  });
});
