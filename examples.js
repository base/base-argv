'use strict';

var Base = require('base');
var tasks = require('base-tasks');
var cli = require('base-cli');
var argv = require('./');
var app = new Base();

// register plugins
app.use(cli());
app.use(tasks());
app.use(argv());

app.task('foo', function(cb) {
  console.log('task > default');
  cb();
});

// parse argv
var args = app.argv(['--a=b:c', '--a=d:e', '--f g']);
console.log(args)

var args = app.argv(['--a:b:c', '--a:d:e', '--f g']);
console.log(args)

var args = app.argv(['--a:b=c', '--a d:e', '--f g']);
console.log(args)

var args = app.argv(['foo', 'bar', '--set=a:b']);
console.log(args)
