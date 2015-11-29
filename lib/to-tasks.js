'use strict';

var utils = require('./utils');

/**
 * expose `toTasks`
 */

module.exports = function toTasks(tasks, app, prop) {
  if (!prop) prop = 'app';
  if (!app) app = {};

  tasks = arrayify(tasks);
  tasks = tasks.reduce(function(acc, str) {
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
      // if the current `app` does not have a task named `key`,
      // check to see if there is a generator or updater etc.
      // with that name
      if (app && app.tasks && !app.tasks[key] && cache.hasOwnProperty(key)) {
        val = resolveTasks(cache[key]);
        if (!val) continue;
      } else {
        val = key;
        key = 'base';
      }
    }

    if (val === '*') {
      if (cache[key]) {
        val = Object.keys(cache[key].tasks);
      }
    }

    if (typeof val === 'string') {
      val = val.split(',');
    }

    if (prevKey === key && i > 0) {
      val = prevVal.concat(val);
      // var prev = res[i - 1] || res;
        // console.log(res)
      // [prevKey] = val;
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
  var tasks = app.tasks;
  if (tasks.hasOwnProperty('default')) {
    return ['default'];
  }
  var keys = Object.keys(tasks);
  if (!keys.length) return null;
  return keys;
}

/**
 * Cast `value` to an array
 */

function arrayify(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}
