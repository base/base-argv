/*!
 * base-argv <https://github.com/jonschlinkert/base-argv>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var toTasks = require('./to-tasks');
var expandArgs = require('expand-args');
var expand = require('expand-object');
var union = require('union-value');
var omit = require('object.omit');
var pick = require('object.pick');

module.exports = function(argv) {
  return function(app) {

    app.define('argv', processArgs(argv));

    this.argv.commands = function commands(argv) {
      argv._ = argv._ || [];
      var commands = {};
      argv._.forEach(function(key) {
        commands[key] = true;
      });
      return commands;
    };
  };
};

function processArgs(argv) {
  return function(config, options) {
    options = options || {};
    var commands = config.commands;
    var plural = options.plural;
    var tasks = config.tasks;

    var res = {};
    res.argv = argv;
    res._ = [];
    res.commands = {};
    res.options = {};
    // res[plural] = {base: []};
    res[plural] = [];

    var appKeys = Object.keys(config[plural]);
    var taskKeys = Object.keys(tasks);

    var arr = argv._;
    var len = arr.length, i = -1;

    while (++i < len) {
      var key = arr[i];

      if (isApp(appKeys, key) || isTask(taskKeys, key)) {
        var obj = toTasks(key, config, plural);
        res[plural] = res[plural].concat(obj);
        continue;
      }

      res._.push(key);
    }

    for (var key in argv) {
      if (key === '_') {
        continue;
      }

      if (isCommand(commands, key)) {
        var val = argv[key];
        console.log(expandArgs([val]))
        if (typeof val === 'boolean' || !/\W/.test(String(val))) {
          res.commands[key] = val;
        } else {
          res.commands[key] = expand(val);
        }
      } else {
        var val = argv[key];
        if (typeof val === 'boolean' || !/\W/.test(String(val))) {
          res.options[key] = val;
        } else {
          res.options[key] = expand(val);
        }
      }
    }
    return res;
  };
}

/**
 * Utils
 */

function contains(arr, key) {
  return arr.indexOf(key) > -1;
}

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
  if(arr.indexOf(key) > -1) {
    return true;
  }
  var seg = key.split(/\W/).shift();
  return arr.indexOf(seg) > -1;
}

function toTasks(obj, str) {

}

var config = {
  commands: ['set', 'get', 'del', 'store', 'init', 'option', 'data', 'list'],
  tasks: {
    a: {},
    b: {},
    c: {},
  },
  generators: {
    node: {
      tasks: ['default', 'init']
    },
    mocha: {
      tasks: ['default', 'init']
    },
    gulp: {
      tasks: ['default', 'gulpfile', 'plugin']
    },
    foo: {
      tasks: {
        a: {},
        b: {},
        c: {},
      },
      generators: {
        node: {
          tasks: ['default', 'init']
        },
        mocha: {
          tasks: ['default', 'init']
        },
        gulp: {
          tasks: ['default', 'gulpfile', 'plugin']
        }
      }
    }
  }
};

var argv = require('minimist')(['node:init', 'a,b,c', 'foo.node:init', '--set=name:Jon', '--get=one', 'blah', '--do=it']);
var args = processArgs(argv)(config, {
  plural: 'generators'
});

console.log(args)
