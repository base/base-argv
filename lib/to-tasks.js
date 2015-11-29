'use strict';

var utils = require('./utils');

/**
 * expose `toTasks`
 */

module.exports = function toTasks(tasks, app, prop) {
  if (!prop) prop = 'app';
  if (!app) app = {};

  tasks = utils.arrayify(tasks).reduce(function(acc, str) {
    if (utils.isObject(str)) {
      return acc.concat(str);
    }
    return acc.concat(str.split('|'));
  }, []);

  var cache = app[prop] || {};
  var len = tasks.length, i = -1;
  var prevKey, prevVal;
  var res = [];

  while (++i < len) {
    var task = tasks[i];
    if (utils.isObject(task)) {
      res.push(task);
      continue;
    }

    task = task.split(':');
    var key = task[0];
    var val = task[1];

    if (!val) {
      // if the current `app` does not have a task named `key`, check
      // to see if there is a generator or updater etc. with that name
      if (app && ((app.tasks && !app.tasks[key]) || cache.hasOwnProperty(key))) {
        val = resolveTasks(cache[key]);
        if (!val) continue;
      } else {
        val = key;
        key = 'base';
      }
    }

    if (typeof val === 'string') {
      val = val.split(',');
    }

    if (prevKey === key && i > 0) {
      val = prevVal.concat(val);
    } else {
      var obj = {};
      obj[key] = val;
      res.push(obj);
    }

    prevVal = val;
    prevKey = key;
  }
  return res;
};

function resolveTasks(app) {
  app = app || {};
  var tasks = app.tasks;
  if (!tasks) {
    return ['default'];
  }

  if (utils.isObject(tasks)) {
    tasks = Object.keys(tasks);
  }

  if (Array.isArray(tasks) && !tasks.length) {
    return ['default'];
  }

  if (tasks.indexOf('default') > -1) {
    return ['default'];
  }
  return tasks;
}
