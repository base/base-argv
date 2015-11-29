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
    app.argv = processArgs(app, options);
  };
};

function processArgs(app, options) {
  options = options || {};
  var plural = options.plural;
  var commands = app.commands;
  var tasks = app.tasks;

  return function(argv) {
    argv = !utils.isObject(argv)
      ? minimist(utils.arrayify(argv))
      : argv;

    var res = {};
    res.argv = utils.extend({}, argv);
    res._ = [];
    res.commands = {};
    res.options = {};
    res[plural] = [];

    var appKeys = Object.keys(app[plural]);
    var taskKeys = Object.keys(tasks);

    var arr = argv._;
    var len = arr.length, i = -1;

    while (++i < len) {
      var ele = arr[i];

      if (isApp(appKeys, ele) || isTask(taskKeys, ele)) {
        var obj = toTasks(ele, app, plural);
        res[plural] = res[plural].concat(obj);
        continue;
      }

      res._.push(ele);
    }

    for (var key in argv) {
      if (key === '_') {
        continue;
      }

      var arr = utils.arrayify(argv[key]);
      var expanded = utils.expandArgs(arr)[0];

      if (isCommand(commands, key)) {
        res.commands[key] = expanded;
      } else {
        res.options[key] = expanded;
      }
    }
    return res;
  };
}

module.exports.process = processArgs;

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
  if (arr.indexOf(key) > -1) {
    return true;
  }
  var seg = key.split(/\W/).shift();
  return arr.indexOf(seg) > -1;
}
