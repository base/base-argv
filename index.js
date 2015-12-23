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
var toKeys = require('./lib/keys');

module.exports = function(options) {
  return function(app) {
    app.define('argv', function(argv) {
      var opts = toKeys(app, options);
      return processArgv(argv, opts);
    });
  };
};

function processArgv(argv, options) {
  var opts = options || {};
  var commands = opts.commands;

  if (Array.isArray(argv)) {
    argv = minimist(utils.arrayify(argv));
  }

  var res = {
    orig: utils.extend({}, argv),
    _: [],
    tasks: [],
    commands: {},
    options: {}
  };

  if (typeof opts.prop === 'string') {
    res[opts.prop] = [];
  }

  for (var key in argv) {
    if (key === '_') {
      res = reduceArray(argv[key], res, opts);
    }
    res = reduceOptions(argv[key], key, res, commands);
  }
  return res;
};

/**
 * Utils
 */

function reduceArray(args, res, opts) {
  var prop = opts.prop;
  var apps = prop ? opts[prop] : null;
  var tasks = opts.tasks;


  var len = args.length, i = -1;
  while (++i < len) {
    var ele = args[i];

    if (/,/.test(ele) && !/[.|:=]/.test(ele)) {
      res.tasks = utils.union(res.tasks, ele.split(','));
      continue;
    }

    if (isApp(apps, ele) || isTask(tasks, ele)) {
      if (prop) {
        var obj = toTasks(ele, opts, prop);
        res[prop] = res[prop].concat(obj);
      } else {
        res.tasks = utils.union(res.tasks, ele.split(','));
      }
    } else {
      res._.push(ele);
    }
  }
  return res;
}

function reduceOptions(val, key, res, commands) {
  var args = utils.expandArgs(utils.arrayify(val))[0];
  if (isCommand(commands, key)) {
    res.commands[key] = args;
  } else {
    res.options[key] = args;
  }
  return res;
}

function isApp(apps, key) {
  var res = is(apps, key);
  return res;
}

function isCommand(commands, key) {
  return is(commands, key);
}

function isTask(tasks, key) {
  return is(tasks, key);
}

function is(val, key, ch) {
  if (!val) return false;

  if (typeof key !== 'string') {
    throw new TypeError('expected key to be a string');
  }

  var segs = key.split(/\W/);
  var prop = segs[0];

  if (utils.isObject(val)) {
    if (val.hasOwnProperty(key)) {
      return true;
    }
    if (val.hasOwnProperty(prop)) {
      return true;
    }
  }

  if (Array.isArray(val)) {
    if (val.indexOf(key) !== -1) {
      return true;
    }
    if (val.indexOf(prop) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * Expose `processArgv` method
 */

module.exports.processArgv = processArgv;
