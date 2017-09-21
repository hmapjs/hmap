'use strict';

var hmap = require('../index');
var fs = require('fs');

var html = fs.readFileSync(__dirname + '/cases/github-full.html', 'utf8');
console.time("sample");
console.log(hmap(__dirname + "/cases/github.hmap", html));
console.timeEnd("sample");


// 2222
var html = fs.readFileSync(__dirname + '/cases/test2.html', 'utf8');
console.time("sample2");
console.log(hmap(__dirname + "/cases/test2.hmap", html));
console.timeEnd("sample2");
