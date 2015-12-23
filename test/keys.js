'use strict';

require('mocha');
var cli = require('base-cli');
var Base = require('base-methods');
var tasks = require('base-tasks');
var assert = require('assert');
var utils = require('../lib/utils');
var keys = require('../lib/keys');
var base;

describe('keys', function() {
  beforeEach(function() {
    base = new Base();
    base.use(function(app) {
      app.generators = {};
      app.define('generator', function(key, fn) {
        this.generators[key] = fn;
      });
    });
    base.use(tasks());
    base.use(cli());

    base.task('a', function() {});
    base.task('b', function() {});
    base.task('c', function() {});

    base.generator('one', function() {});
    base.generator('two', function() {});
    base.generator('three', function() {});
  });

  it('should export a function', function() {
    assert.equal(typeof keys, 'function');
  });

  it('should return an object', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(utils.isObject(actual));
  });

  it('should has a tasks property', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(actual.hasOwnProperty('tasks'));
  });

  it('should has a commands property', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(actual.hasOwnProperty('commands'));
  });

  it('should has a generators property', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(actual.hasOwnProperty('generators'));
  });

  it('should create an array of task keys', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(Array.isArray(actual.tasks));
  });

  it('should create an array of command keys', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(Array.isArray(actual.commands));
  });

  it('should create an array of "generator" keys', function() {
    var actual = keys(base, {prop: 'generator'});
    assert(Array.isArray(actual.generators));
  });

  describe('update keys', function() {
    it('should update task keys when a task is added', function() {
      var actual = keys(base, {prop: 'generator'});
      assert(actual.tasks.length === 3);
      base.task('d', function() {});
      assert(actual.tasks.length === 4);
    });

    it('should update generator keys when a generator is added', function() {
      var actual = keys(base, {prop: 'generator'});
      assert(actual.generators.length === 3);
      base.generator('four', function() {});
      assert(actual.generators.length === 4);
    });

    it('should update command keys when a command is added', function() {
      var actual = keys(base, {prop: 'generator'});
      assert(actual.commands.length === 15);
      base.cli.map('foo', function() {});
      assert(actual.commands.length === 16);
    });
  });
});
