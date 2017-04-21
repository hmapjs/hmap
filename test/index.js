'use strict';

var hmap = require('../index');
var fs = require('fs');

var html = fs.readFileSync(__dirname + '/cases/github-full.html', 'utf8');
console.time("sample");
console.log(hmap(__dirname + "/cases/github.hmap", html));
console.timeEnd("sample");
