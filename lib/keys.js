'use strict';

var utils = require('./utils');

module.exports = function createKeys(app, options) {
  var opts = options || {};
  var cache = {};

  // get the name of the property to use for "apps", and ensure that
  // it's pluralized. This would be `generators` or `verbfiles` or
  // `apps` etc
  var prop = opts.prop
    ? utils.pluralize(opts.prop)
    : null;

  // create an array of keys from `app[prop]` (generators etc)
  if (prop && prop in app) {
    Object.defineProperty(opts, prop, {
      configurable: true,
      enumerable: true,
      set: function(apps) {
        cache.apps = apps;
      },
      get: function() {
        return cache.apps || Object.keys(app[prop]);
      }
    });
  }

  // create an array of task keys
  if (app.tasks) {
    Object.defineProperty(opts, 'tasks', {
      configurable: true,
      enumerable: true,
      set: function(tasks) {
        cache.tasks = tasks;
      },
      get: function() {
        return cache.tasks || Object.keys(app.tasks);
      }
    });
  }

  // get the array of command keys from the cli plugin
  if (app.cli && Array.isArray(app.cli.keys)) {
    Object.defineProperty(opts, 'commands', {
      configurable: true,
      enumerable: true,
      set: function(val) {
        cache.cli = val;
      },
      get: function() {
        return cache.cli || app.cli.keys;
      }
    });
  }
  return opts;
};
