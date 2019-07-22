"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.fsExistsSync = (path) => {
    try {
        fs.accessSync(path, fs.constants.F_OK);
    }
    catch (e) {
        return false;
    }
    return true;
};
exports.isjs = (filename) => {
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
exports.getFilePrefix = (filename) => {
    let pos = filename.lastIndexOf('.');
    if (pos === -1) {
        return false;
    }
    return filename.substr(0, pos);
};
exports.deepFreeze = (function freeze(obj, ignore) {
    let propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(function (name) {
        if (name === ignore) {
            return;
        }
        let prop = obj[name];
        if (typeof prop == 'object' && prop !== null) {
            freeze(prop);
        }
    });
    return Object.freeze(obj);
});
exports.get = (object, path, def) => {
    return (path = Array.isArray(path) ? path : path.split('.')).reduce((obj, p) => {
        return obj && obj[p];
    }, object) === undefined ? def : undefined;
};
exports.set = (object, path, val) => {
    return ((path = Array.isArray(path) ? path : path.split('.')).slice(0, -1).reduce((obj, p) => {
        return obj[p] = obj[p] || {};
    }, object)[path.pop()] = val), object;
};
exports.curry = (fn) => {
    let limit = fn.length;
    return function _curry(...args) {
        if (args.length === limit) {
            return fn.apply(null, args);
        }
        else {
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
//# sourceMappingURL=index.js.map