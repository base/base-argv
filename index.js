/*!
 * base-argv <https://github.com/jonschlinkert/base-argv>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var utils = require('./utils');

module.exports = function(config) {
  return function() {
    if (this.isRegistered('base-argv')) return;

    this.define('argv', function(argv, options) {
      var orig = utils.extend({}, argv);
      var opts = utils.extend({}, config, this.options, options, argv);
      var res = processArgv(this, argv, opts);
      if (res.expand === 'false' || opts.expand === false) {
        delete res.expand;
        return res;
      }
      res.orig = orig;
      return res;
    });
  };
};

/**
 * Expand command line arguments into the format we need to pass
 * to `app.cli.process()`.
 *
 * Add a `default` task is added to the `tasks` array if no tasks
 * were defined, and only whitelisted flags are passed.
 *
 * @param {Object} `app` Application instance
 * @param {Object} `argv` argv object, parsed by minimist
 * @param {Array} `options.first` The keys to pass to `app.cli.process()` first.
 * @param {Array} `options.last` The keys to pass to `app.cli.process()` last.
 * @param {Array} `options.keys` Flags to whitelist
 * @return {Object} Returns the `argv` object with sorted keys.
 */

function processArgv(app, argv, options) {
  var opts = utils.extend({}, options);

  if (Array.isArray(argv)) {
    argv = utils.minimist(argv, options);
  }

  if (opts.expand === false || argv.expand === 'false') {
    return argv;
  }

  // shallow clone parsed args from minimist
  var parsed = utils.extend({}, argv);

  // move the splat array
  var tasks = argv._;
  delete argv._;

  var keys = Object.keys(argv);
  var len = keys.length;

  // expand args with "expand-args"
  argv = utils.expandArgs(argv);

  if (Array.isArray(argv.tasks)) {
    utils.union(argv.tasks, tasks);
  } else {
    argv.tasks = tasks;
  }

  if (argv.file) len--;
  if (argv.cwd) len--;
  if ((argv.file || argv.cwd || len === 0) && argv.tasks.length === 0) {
    argv.tasks = ['default'];
  }

  if (argv.tasks.length === 0 && len > 0) {
    delete argv.tasks;
  }

  var res = sortArgs(app, argv, options);
  res.minimist = parsed;
  return res;
}

/**
 * Sort arguments so that `app.cli.process` executes commands
 * in the order specified.
 *
 * @param {Object} `app` Application instance
 * @param {Object} `argv` The expanded argv object
 * @param {Object} `options`
 * @param {Array} `options.first` The keys to run first.
 * @param {Array} `options.last` The keys to run last.
 * @return {Object} Returns the `argv` object with sorted keys.
 */

function sortArgs(app, argv, options) {
  options = options || [];

  var first = options.first || [];
  var last = options.last || [];
  var cliKeys = [];

  if (app.cli && app.cli.keys) {
    cliKeys = app.cli.keys;
  }

  var keys = utils.union(first, cliKeys, Object.keys(argv));
  keys = utils.diff(keys, last);
  keys = utils.union(keys, last);

  var len = keys.length;
  var idx = -1;
  var res = {};

  while (++idx < len) {
    var key = keys[idx];
    if (argv.hasOwnProperty(key)) {
      res[key] = argv[key];
    }
  }
  return res;
}
