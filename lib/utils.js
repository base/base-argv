'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('mixin-deep', 'merge');
require('arrayify-compact', 'arrayify');
require('extend-shallow', 'extend');
require('inflection', 'inflect');
require('isobject', 'isObject');
require('arr-union', 'union');
require('expand-args');
require = fn;

/**
 * Singularize the given `name`
 */

utils.singularize = function single(name) {
  return utils.inflect.singularize(name);
};

/**
 * Pluralize the given `name`
 */

utils.pluralize = function plural(name) {
  return utils.inflect.pluralize(name);
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
