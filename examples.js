'use strict';

var Base = require('base');
var argv = require('./');
var app = new Base();
app.use(argv());

// parse argv
var args = app.argv(['--a=b:c', '--a=d:e', '--f', 'g']);
console.log(args)

var args = app.argv(['--a:b:c', '--a:d:e', '--f', 'g']);
console.log(args)

var args = app.argv(['--a:b=c', '--a', 'd:e', '--f', 'g']);
console.log(args)

var args = app.argv(['foo', 'bar', '--set=a:b']);
console.log(args)

var args = app.argv(['--file=index.js']);
console.log(args)

var args = app.argv(['--file=index.js'], {esc: ['file']});
console.log(args)
