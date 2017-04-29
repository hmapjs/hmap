'use strict';

const fs = require('fs');
const path = require('path')
const lex = require('hmap-lexer');
const parse = require('hmap-parser');
const mapAst = require('./lib/map-ast');
const traverse = require('./lib/traverse');
const cheerio = require('cheerio');

module.exports = hmap;
module.exports.Hmap = Hmap;

function hmap(templatePath, html, options) {
  if (!templatePath) {
    throw new Error('templatePath is required');
  }
  if (typeof(templatePath) !== "string") {
    throw new Error('Expected "templatePath" to be an string but got "' + (typeof options) + '"');
  }

  let absPath = path.resolve(templatePath);
  let filename = path.basename(templatePath);
  let content = fs.readFileSync(absPath, 'utf8');
  let tokens = lex(content, {filename});
  let ast = parse(Object.assign([], tokens), {filename, src: content});
  // let templateData = mapAst(ast, {filename});
  let templateData = traverse(ast, {filename});

  let hmaper = new Hmap(templateData, options)

  return JSON.parse(JSON.stringify(hmaper.parseHtml(html)));
};

function Hmap(templateData, options) {
  this.templateData = templateData;
}
Hmap.prototype.parseHtml = function(html) {
  if(!html) {
    throw new Error('html is required');
  }

  let dataList = JSON.parse(JSON.stringify(this.templateData));
  let $ = cheerio.load(html);
  let result = {};
  dataList.forEach(function(item) {
    if (item.type === "Code") {
      result[item.val] = $(item.nodePath).text();
    } else if (item.type === "Attr") {
      result[item.val] = $(item.nodePath).attr(item.attrName) || '';
    }
  })

  return result;
};
