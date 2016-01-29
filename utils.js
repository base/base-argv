'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);

/**
 * Temporarily re-assign `require` to trick browserify and
 * webpack into reconizing lazy dependencies.
 *
 * This tiny bit of ugliness has the huge dual advantage of
 * only loading modules that are actually called at some
 * point in the lifecycle of the application, whilst also
 * allowing browserify and webpack to find modules that
 * are depended on but never actually called.
 */

var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('arr-diff', 'diff');
require('array-union', 'union');
require('define-property', 'define');
require('expand-args');
require('extend-shallow', 'extend');
require('minimist');
require = fn;

/**
 * Cast the given `value` to an array.
 *
 * ```js
 * utils.arrayify('foo');
 * //=> ['foo']
 *
 * utils.arrayify(['foo']);
 * //=> ['foo']
 * ```
 * @param {String|Array} `value`
 * @return {Array}
 * @api public
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
