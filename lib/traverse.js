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
        this.addToResult(this.currentNode);//添加到结果列表
      }
    }
  },
  addToResult: function(node) {
    node.nodePath = node.path.join(' ');
    this.result.push(node);
  },
  genPath: function(node) {
    if(node.type === "Block"){
      return '';
    }

    this.checkAttr(node);
    var path = node.name + this.parseAttr(node.attrs);
    return path;
  },
  parseAttr: function(attrs) {
    var result = '';
    if(attrs){
      attrs.forEach(function(item){
        if (item.name == "id") {
          result += "#" + item.val.replace(/'/g, "").replace(/"/g, "");
        } else if (item.name == "class") {
          result += "." + item.val.replace(/'/g, "").replace(/"/g, "");
        } else {
          result += "[" + item.name + "=" + JSON.parse(JSON.stringify(item.val)) + "]";
        }
      });
    }

    return result;
  },
  checkAttr: function(node){
    let attrs = node.attrs;
    if(attrs) {
      for (let i = 0; i < attrs.length; i++) {
        let val = attrs[i].val;
        let name = attrs[i].name;

        if (!(val.indexOf('"') >= 0 || val.indexOf("'") >= 0)) {
          // 是变量, 添加到结果列表中
          this.addToResult({
            type: "Attr",
            val: val,
            line: node.line,
            attrName: name,
            filename: node.filename,
            path: node.path
          });
        }
      }
    }
  }
}
