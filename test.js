'use strict';

require('mocha');
var assert = require('assert');
var baseArgv = require('./');

describe('base-argv', function() {
  it('should export a function', function() {
    assert.equal(typeof baseArgv, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      baseArgv();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected a string');
    }
  });
});
