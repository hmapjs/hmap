'use strict';
module.exports = traverse;
module.exports.Traverser = Traverser;

function traverse(ast, options) {
  var traverser = new Traverser(ast, options);
  traverser.traverseTree();
  return JSON.parse(JSON.stringify(traverser.result));
}
function Traverser(ast, options){
  options = options || {};
  if (typeof ast !== 'object') {
    throw new Error('Expected ast to be an object but got "' + (typeof ast) + '"');
  }
  if (typeof options !== 'object') {
    throw new Error('Expected "options" to be an object but got "' + (typeof options) + '"');
  }
  this.ast = Object.assign({}, ast);
  this.filename = options.filename;
  this.src = options.src;
  this.plugins = options.plugins || [];
  this.currentNode = this.ast;
  this.parentNode = this.ast;
  this.parentNodePath = [];
  this.result = [];
  this.iterationProtect = options.iterationProtect || 20;
  this.index = 0;
}

Traverser.prototype = {
  constructor: Traverser,
  traverseTree: function(parentNode){
    if(this.currentNode.type === "Block"){
      var tmp = this.currentNode;
      for (var i = 0; i < tmp.nodes.length; i++) {
        this.currentNode = tmp.nodes[i];
        this.currentNode.path = Object.assign([], tmp.path);
        this.traverseTree(tmp);
      }
    }else {
      if(this.currentNode.block){
        var tmp = this.currentNode;
        if(!tmp.path) {
          tmp.path = [];
        }
        this.currentNode = this.currentNode.block;
        this.currentNode.path = tmp.path.concat(this.genPath(tmp));
        this.traverseTree(tmp);
      }else{
        this.addToResult();//添加到结果列表
      }
    }
  },
  addToResult: function() {
    this.currentNode.path = this.currentNode.path.join(' ');
    this.result.push(this.currentNode);
  },
  genPath: function(node) {
    if(node.type === "Block"){
      return '';
    }

    var path = node.name + this.parseAttr(node.attrs);
    return path;
  },
  parseAttr: function(attrs) {
    var result = '';
    attrs.forEach(function(item){
      if (item.name == "id") {
        result += "#" + item.val.replace(/'/g, "").replace(/"/g, "");
      } else if (item.name == "class") {
        result += "." + item.val.replace(/'/g, "").replace(/"/g, "");
      } else {
        result += "[" + item.name + "=" + JSON.parse(JSON.stringify(item.val)) + "]";
      }
    });

    return result;
  }
}
