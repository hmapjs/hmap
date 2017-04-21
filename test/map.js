'use strict';

var fs = require('fs');
var lex = require('hmap-lexer');
var parse = require('hmap-parser');
var mapAst = require('../lib/map-ast');

var filename = 'github.hmap';
var testCase = fs.readFileSync(__dirname + '/cases/' + filename, 'utf8');
var tokens = lex(testCase, {filename});
var ast = parse(Object.assign([], tokens), {filename, src: testCase});

// console.log(JSON.stringify(ast));
console.log(mapAst(ast, {filename}));
