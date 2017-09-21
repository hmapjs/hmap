'use strict';

var fs = require('fs');
var lex = require('hmap-lexer');
var parse = require('hmap-parser');
var traverse = require('../lib/traverse');
var mapAst = require('../lib/map-ast');

var filename = 'for-case.hmap';
var testCase = fs.readFileSync(__dirname + '/cases/' + filename, 'utf8');
var tokens = lex(testCase, {filename});
var ast = parse(Object.assign([], tokens), {filename, src: testCase});

console.dir(ast, {depth: 10});

console.dir(mapAst(ast, {filename}));
