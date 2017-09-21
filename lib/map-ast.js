'use strict';
// deprecated
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
          if (this.currentNode.type === "Tag") {
            // 检查属性中是否有变量
            this.checkAttr(this.currentNode.attrs);
            this.parentNodePath.push(this.currentNode.name + this.parseAttr(this.currentNode.attrs)); //path 描述
          } else {
            // 不可继续获取子元素
            if (this.currentNode.type === "Code") {
              // 只有code字段会添加到结果列表,其他终点字段会被无视
              this.result.push(Object.assign({
                nodePath: this.parentNodePath.join(" ")
              }, this.currentNode));
            }
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
  },
  parseAttr: function(attrs) {
    let result = "";
    attrs.forEach(function(item) {
      if (item.name == "id") {
        result += "#" + item.val.replace(/'/g, "").replace(/"/g, "");
      } else if (item.name == "class") {
        result += "." + item.val.replace(/'/g, "").replace(/"/g, "");
      } else {
        result += "[" + item.name + "=" + JSON.parse(JSON.stringify(item.val)) + "]";
      }
    });
    return result;
  },
  // 检查属性中是否有变量
  // IDEA: 如果遇到在一个字段中要获取多个值的情况,可以尝试使用写多条并联map的方式
  checkAttr: function(attrs) {
    for (let i = 0; i < attrs.length; i++) {
      let val = attrs[i].val;
      let name = attrs[i].name;

      if (!(val.indexOf('"') >= 0 || val.indexOf("'") >= 0)) {
        // 是变量, 添加到结果列表中
        let _attrs = Object.assign([], this.currentNode.attrs);
        for (let i = 0; i < _attrs.length; i++) {
          let attr = _attrs[i];
          if (attr.val === val) {
            _attrs.splice(i, 1);
            break;
          }
        }
        this.currentNode.attrs = _attrs;
        // 为不防止正常流程的parentNodePath变量变更以影响到后续变量节点获取.采取临时变量操作
        let _nodepath = Object.assign([], this.parentNodePath);
        _nodepath.push(this.currentNode.name + this.parseAttr(_attrs));
        this.result.push(Object.assign({
          nodePath: _nodepath.join(" "),
          val: val,
          attrName: name
        }, this.currentNode));
        return false;
      } else {
        return true;
      }
    }
  }
}
