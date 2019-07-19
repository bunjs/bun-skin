"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.last-index-of");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.string.split");

const fs = require('fs');

exports.fsExistsSync = path => {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    return false;
  }

  return true;
};

exports.isjs = filename => {
  // 判断文件后缀
  let pos = filename.lastIndexOf('.');

  if (pos === -1) {
    return false;
  }

  let filePrefix = filename.substr(0, pos);
  let filePostfix = filename.substr(pos + 1);

  if (filePrefix.length < 1 || filePostfix.length < 1 || filePostfix !== 'js') {
    return false;
  }

  return true;
};

exports.getFilePrefix = filename => {
  // 判断文件后缀
  let pos = filename.lastIndexOf('.');

  if (pos === -1) {
    return false;
  }

  return filename.substr(0, pos);
};

exports.deepFreeze = function freeze(obj, ignore) {
  // 取回定义在obj上的属性名
  var propNames = Object.getOwnPropertyNames(obj); // 在冻结自身之前冻结属性

  propNames.forEach(function (name) {
    if (name === ignore) {
      return;
    }

    var prop = obj[name]; // 如果prop是个对象，冻结它

    if (typeof prop == 'object' && prop !== null) {
      freeze(prop);
    }
  }); // 冻结自身(no-op if already frozen)

  return Object.freeze(obj);
};

exports.get = (object, path, def) => {
  return (path = path.split ? path.split('.') : path).reduce((obj, p) => {
    return obj && obj[p];
  }, object) === undefined ? def : undefined;
};

exports.set = (object, path, val) => {
  return (path = path.split ? path.split('.') : path).slice(0, -1).reduce((obj, p) => {
    return obj[p] = obj[p] || {};
  }, obj = object)[path.pop()] = val, object;
};

exports.curry = fn => {
  let limit = fn.length;
  return function _curry(...args) {
    if (args.length === limit) {
      return fn.apply(null, args);
    } else {
      return (...args2) => {
        return _curry.apply(null, args.concat(args2));
      };
    }
  };
};

exports.run = (...fns) => {
  let fnArra = Array.prototype.slice.call(fns, 0);
  let fn1 = fnArra.pop();
  return (...args) => {
    return fnArra.reverse().reduce((val, fn) => {
      return fn(val);
    }, fn1(...args));
  };
};