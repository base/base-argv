/*!
 * base-argv <https://github.com/jonschlinkert/base-argv>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var minimist = require('minimist');
var toTasks = require('./lib/to-tasks');
var utils = require('./lib/utils');

module.exports = function(options) {
  return function(app) {
    var opts = utils.extend({}, options);
    if (opts.prop) {
      opts[opts.prop] = app[opts.prop];
    }

    opts.commands = app.commands || [];

    // add `keys` from base-config plugin (map-config)
    if (app.config && Array.isArray(app.config.keys)) {
      opts.commands = utils.union(opts.commands, app.config.keys);
    }
    // add `keys` from base-cli plugin (map-config)
    if (app.cli && Array.isArray(app.cli.keys)) {
      opts.commands = utils.union(opts.commands, app.cli.keys);
    }

    opts.tasks = app.tasks;
    app.define('processArgv', processArgv(opts));
  };
};

function processArgv(options) {
  var opts = utils.extend({}, options);
  var commands = opts.commands;
  var tasks = opts.tasks;
  var prop = opts.prop;

  return function(argv) {
    argv = !utils.isObject(argv)
      ? minimist(utils.arrayify(argv))
      : argv;

    var res = {};
    res.orig = utils.extend({}, argv);
    res._ = [];
    res.tasks = [];
    res.commands = {};
    res.options = {};
    if (prop) res[prop] = [];

    var appKeys = (prop && opts.hasOwnProperty(prop))
      ? Object.keys(opts[prop])
      : [];

    var taskKeys = !Array.isArray(tasks)
      ? (tasks ? Object.keys(tasks) : [])
      : tasks;

    var arr = argv._;
    var len = arr.length, i = -1;

    while (++i < len) {
      var ele = arr[i];

      if (/,/.test(ele) && !/[.|:]/.test(ele)) {
        res.tasks = utils.union(res.tasks, ele.split(','));
        continue;
      }

      if (isApp(appKeys, ele) || isTask(taskKeys, ele)) {
        if (prop) {
          var obj = toTasks(ele, opts, prop);
          res[prop] = res[prop].concat(obj);
        } else {
          res.tasks = utils.union(res.tasks, ele.split(','));
        }
        continue;
      }
      res._.push(ele);
    }

    for (var key in argv) {
      if (key === '_') {
        continue;
      }

      var argvArr = utils.arrayify(argv[key]);
      var expanded = utils.expandArgs(argvArr)[0];

      if (isCommand(commands, key)) {
        res.commands[key] = expanded;
      } else {
        res.options[key] = expanded;
      }
    }
    return res;
  };
}

module.exports.processArgv = processArgv;

/**
 * Utils
 */

function isApp(apps, key) {
  return is(apps, key);
}

function isCommand(commands, key) {
  return is(commands, key);
}

function isTask(tasks, key) {
  return is(tasks, key);
}

function is(arr, key, ch) {
  if (!arr) return false;
  if (arr.indexOf(key) > -1) {
    return true;
  }
  var seg = key.split(/\W/).shift();
  return arr.indexOf(seg) > -1;
}
