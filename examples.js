'use strict';

var minimist = require('minimist');
var expand = require('./');

var app = {
  commands: ['set', 'get', 'del', 'store', 'init', 'option', 'data', 'list'],
  tasks: {
    a: {},
    b: {},
    c: {},
  },
  generators: {
    node: {
      tasks: {
        'default': {},
        init: {}
      }
    },
    mocha: {
      tasks: {
        'default': {},
        init: {}
      }
    },
    gulp: {
      tasks: {
        'default': {},
        gulpfile: {},
        plugin: {}
      }
    },
    foo: {
      tasks: {
        a: {},
        b: {},
        c: {},
      },
      generators: {
        node: {
          tasks: {
            'default': {},
            init: {}
          }
        },
        mocha: {
          tasks: {
            'default': {},
            init: {}
          }
        },
        gulp: {
          tasks: {
            'default': {},
            gulpfile: {},
            plugin: {}
          }
        }
      }
    }
  }
};

var argv = minimist([
  'node:init',
  'a,b,c',
  'foo.node:init',
  '--set=name:Jon',
  '--get=one',
  'blah',
  '--do=it'
]);

var create = expand.process(app, {plural: 'generators'});
var args = create(argv);

console.log(args)
