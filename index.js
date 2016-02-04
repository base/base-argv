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
      var orig = Array.isArray(argv) ? argv.slice() : utils.extend({}, argv);
      var opts = utils.extend({}, config, this.options, options, argv);
      var args = processArgv(this, argv, opts);
      if (args.expand === 'false' || opts.expand === false) {
        delete args.expand;
        return args;
      }

      utils.define(args, 'orig', orig);
      this.emit('argv', args);
      return args;
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
  argv = utils.expandArgs(argv, opts);

  // union array tasks with tasks passed with `--tasks` flag
  argv.tasks = utils.union(utils.arrayify(argv.tasks), tasks);

  // allow a default task to be set when only whitelisted flags
  // are passed (and no other tasks are defined)
  var whitelist = utils.arrayify(opts.whitelist);
  var wlen = whitelist.length;
  while (wlen--) {
    var ele = whitelist[wlen];
    if (argv.hasOwnProperty(ele)) {
      len--;
    }
  }

  if ((len === 0 || argv.run) && argv.tasks.length === 0) {
    argv.tasks = ['default'];
  }

  if (argv.tasks.length === 0 && len > 0) {
    delete argv.tasks;
  }

  var res = sortArgs(app, argv, options);
  utils.define(res, 'minimist', parsed);
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
  return toBoolean(res);
}

function toBoolean(argv) {
  var special = ['set', 'option', 'options', 'data'];
  for (var key in argv) {
    var val = argv[key];

    if (~special.indexOf(key) && typeof val === 'string') {
      var obj = {};
      var isFalse = val.indexOf('no') === 0;
      if (isFalse) {
        val = val.slice(2);
        obj[val] = false;
      } else {
        obj[val] = true;
      }
      val = obj;
    }
    argv[key] = val;
  }

  return argv;
}
