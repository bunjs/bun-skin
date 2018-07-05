'use strict';

/**
 * @file Loader全局方法
 */

const fs = require('fs');
/**
 * Loader方法
 *
 * @param {string} keypath 模块命名时需要去除的路径
 * @param {string} path 要加载的路径
 * @param {string} context 声明上下文
 * @param {string} type 异步加载or同步加载
 * @param {array} ignore 需要忽略的目录
 */
function loader(keypath, path, name = '*', context = global, type, ignore = []) {
    if (!fsExistsSync(bun.ROOT_PATH + path)) {
        bun.Logger.bunwarn('not found ' + bun.ROOT_PATH + path);
        return;
    }

    // 如果没有后缀，则自动加上后缀，只支持.js
    if (name.lastIndexOf('.') === -1) {
        name = name + '.js';
    }
    let fstat = fs.lstatSync(bun.ROOT_PATH + path);

    if (fstat.isFile()) {
        // 对文件进行直接引入操作
        let key = _getFuncName(path, keypath);

        initModule(context, key, bun.ROOT_PATH + path, type);
        return;
    }

    let files = fs.readdirSync(bun.ROOT_PATH + path);
    let breaked = 0;// 结束循环
    files.forEach(filename => {
        if (breaked === 1) {
            return;
        }
        let self = __filename.substring(path.length + 1);
        if (filename === self) {
            return;
        }
        let stat = fs.lstatSync(bun.ROOT_PATH + path + '/' + filename);
        if (stat.isDirectory()) {
            if (ignore.indexOf(filename + '/') !== -1) {
                return;
            }
            loader(keypath, path + '/' + filename, name, context, type, ignore);
            return;
        } else if (ignore.indexOf(filename) !== -1) {
            return;
        }
        let pos = filename.lastIndexOf('.');

        if (pos === -1) {
            return;
        }

        let filePrefix = filename.substr(0, pos);
        let filePostfix = filename.substr(pos + 1);
        if (filePrefix.length < 1 || filePostfix.length < 1 || filePostfix !== 'js') {
            return;
        }
        // name为*代表匹配目录下所有文件，否则匹配单个文件，如果匹配到具体name则结束文件遍历
        if (name !== '*.js') {
            if (filename !== name) {
                return;
            } else {
                let key = _getFuncName(path, keypath, filePrefix);
                initModule(context, key, bun.ROOT_PATH + path + '/' + filePrefix, type);
                breaked = 1;
                return;
            }
            
        }
        let key = _getFuncName(path, keypath, filePrefix);
        initModule(context, key, bun.ROOT_PATH + path + '/' + filePrefix, type);
    });
}
//定义模块
function initModule(context, key, path, type) {
    try {
        if (type === 'async') {
            if (context[key]) {
                // 如果模块已存在作用域中，则报警并覆盖
                // throw new Error('Repeated method name: ' + key + ' in file: ' + path);
                bun.Logger.bunwarn('Repeated method name: ' + key + ' in file: ' + path);
            }
            Object.defineProperty(context, key, {
                get: () => {
                    let mod = require(path);
                    if (mod) {
                        return mod;
                    }
                    bun.Logger.bunwarn('module cannot find path is :' + path);
                    // throw new Error('module cannot find path is :' + path);
                },
                enumerable: true,
                configurable: false
            });
            return;
        }
        let mod = require(path);

        if (mod) {
            context[key] = (() => {
                return mod;
            })();
        } else {
            bun.Logger.bunwarn('module cannot find path is :' + path);
            // throw new Error('module cannot find path is :' + path);
        }
    } catch (e) {
        console.log(e);
    }
}

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try{
        fs.accessSync(path,fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}
// 拼接方法名
function _getFuncName(path, keypath, filePrefix) {
    let newpath = path;
    if (keypath === newpath) {
        newpath = '';
    } else {
        newpath = path.replace(keypath + '/', '');
    }

    let patharr = newpath.split('/');
    if (filePrefix) {
        patharr.push(filePrefix);
    }
    let arr = [];
    for (let i = 0; i < patharr.length; i++) {
        if (!patharr[i]) {
            continue;
        }
        // 首字母大写
        arr.push(patharr[i].replace(/^\S/g, function (s) {
            return s.toUpperCase();
        }));
    }

    return arr.join('_');
}

module.exports = loader;
    