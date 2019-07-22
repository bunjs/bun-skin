import fs = require('fs');

export const fsExistsSync = (path: string) => {
    try{
        fs.accessSync(path, fs.constants.F_OK);
    }catch(e){
        return false;
    }
    return true;
};

export const isjs = (filename: string) => {
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

export const getFilePrefix = (filename: string) => {
    // 判断文件后缀
    let pos = filename.lastIndexOf('.');
    if (pos === -1) {
        return false;
    }
    return filename.substr(0, pos);
};

export const deepFreeze = (function freeze(obj: any, ignore?: string) {
    // 取回定义在obj上的属性名
    let propNames = Object.getOwnPropertyNames(obj);

    // 在冻结自身之前冻结属性
    propNames.forEach(function(name) {
        if (name === ignore) {
            return;
        }
        let prop = obj[name];

        // 如果prop是个对象，冻结它
        if (typeof prop == 'object' && prop !== null) {
		    freeze(prop);
        }
    });

    // 冻结自身(no-op if already frozen)
    return Object.freeze(obj);
});

export const get = (object: any, path: string | Array<string>, def?: any) => {
    return (path = Array.isArray(path) ? path : path.split('.')).reduce((obj, p) => {
        return obj && obj[p];
    }, object) === undefined ? def : undefined;
};

export const set = (object: any, path: string | Array<string>, val: any) => {
    return ((path = Array.isArray(path) ? path : path.split('.')).slice(0, -1).reduce((obj, p) => {
        return obj[p] = obj[p] || {};
    }, object)[path.pop()] = val), object;
};

export const curry = (fn: Function) => {
    let limit = fn.length;
    return function _curry(...args: any) {
        if (args.length === limit) {
            return fn.apply(null, args);
        } else {
            return (...args2: any) => {
                return _curry.apply(null, args.concat(args2));
            };
        }
    };
};

export const run = (...fns: Array<Function>) => {
    let fnArra = Array.prototype.slice.call(fns, 0);
    let fn1 = fnArra.pop();
    return (...args: any) => {
        return fnArra.reverse().reduce((val: any, fn: any) => {
            return fn(val);
        }, fn1(...args));
    };
};
