'use strict';

module.exports = mapper;
module.exports.Mapper = Mapper;

function mapper(ast, options) {
  var mapper = new Mapper(ast, options);
  mapper.map();
  return JSON.parse(JSON.stringify(mapper.result));
};

// 遍历所有的值并获取父级信息
function Mapper(ast, options) {
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
  this.currentNode = null;
  this.parentNode = this.ast;
  this.parentNodePath = [];
  this.result = [];
  this.iterationProtect = options.iterationProtect || 20;
}

Mapper.prototype = {
  constructor: Mapper,
  map: function() {
    while (this.ast.nodes.length > 0) {
      this.checkIteration();
      while (this.getChildNode()) {
        this.checkIteration();
        if (this.currentNode.type !== "Block") {
          if (this.currentNode.type !== "Code") {
            this.parentNodePath.push(this.currentNode.name); //path 描述
          } else {
            this.result.push(Object.assign({
              nodePath: this.parentNodePath.join(" ")
            }, this.currentNode));
            this.parentNodePath = [];
            this.currentNode = this.ast;
            break; //重置指向到根节点
          }
        }
      }
    }

    return this.result;
  },
  // 获取子节点,如果返回为true则说明当前节点有子节点且当前节点已经跳转到子节点
  getChildNode: function(node) {
    if (!this.currentNode) {
      //if root
      this.currentNode = this.parentNode;
      return true;
    }

    if (this.currentNode.type === "Tag") {
      this.parentNode = this.currentNode;
      this.currentNode = this.currentNode.block;
      return true;
    } else if (this.currentNode.type === "Block") {
      if (this.currentNode.nodes.length > 0) {
        this.parentNode = this.currentNode;
        this.currentNode = this.currentNode.nodes.splice(0, 1)[0];
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  // iterationProtect
  checkIteration: function() {
    if (this.iterationProtect-- < 0) {
      throw new Error('iterationProtect have been trigger.please check your file or increase protect num');
    }
  }
}
