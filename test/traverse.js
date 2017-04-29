'use strict';

var fs = require('fs');
var lex = require('hmap-lexer');
var parse = require('hmap-parser');
var traverse = require('../lib/traverse');

var filename = 'github.hmap';
var testCase = fs.readFileSync(__dirname + '/cases/' + filename, 'utf8');
var tokens = lex(testCase, {filename});
var ast = parse(Object.assign([], tokens), {filename, src: testCase});

var res = traverse(ast, {filename});
console.log(res);

// 返回等待映射处理的数据
// console.log(JSON.stringify(ast));
// 返回映射处理后的数据: 即等待抓取/匹配的变量节点
// console.log(mapAst(ast, {filename}));
