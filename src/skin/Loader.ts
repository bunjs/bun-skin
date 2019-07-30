"use strict";

/**
 * @file Loader全局方法
 */

import fs = require("fs");
import { Loader } from "../interface";
import utils = require("./utils");
/**
 * Loader方法
 *
 * @param {string} keypath 模块命名时需要去除的路径
 * @param {string} path 要加载的路径
 * @param {string} name 要加载的文件名，默认*
 * @param {string} context 声明上下文
 * @param {string} type 异步加载or同步加载
 * @param {array}  ignore 需要忽略的目录
 * @param {boolean} isNecessary 是否必要
 */
function loader(obj: Loader) {
    let { keypath, path, name, context, type, ignore, isNecessary } = obj;
    keypath = keypath || '';
    name = name || "*";
    context = context || global;
    type = type || "sync";
    ignore = ignore || [];
    isNecessary = isNecessary || false;
    path = bun.globalPath.ROOT_PATH + path;

    let key: string;
    if (!utils.fsExistsSync(path)) {
        // 如果必要且找不到对应目录，则报警
        if (isNecessary) {
            bun.Logger.bunwarn("bun-loader: Loader not found " + path);
        }
        return;
    }
    const fstat = fs.lstatSync(path);

    if (fstat.isFile()) {
        // 对文件进行直接引入操作
        key = _getFuncName(path, keypath);

        initModule(context, key, path, type);
        return;
    }

    // 如果没有后缀，则自动加上后缀，只支持.js
    if (name.lastIndexOf(".") === -1) {
        name = name + ".js";
    }

    const files = fs.readdirSync(path);
    let breaked = 0; // 结束循环
    files.forEach((filename) => {
        if (breaked === 1) {
            return;
        }
        // let self = filename.substring(path.length + 1);
        // if (filename === self) {
        //     return;
        // }
        const stat = fs.lstatSync(path + "/" + filename);
        if (stat.isDirectory()) {
            // 命中ignore 则直接跳过
            if (ignore.indexOf(filename + "/") !== -1) {
                return;
            }
            // 是文件夹继续循环
            loader({
                keypath,
                path: path.replace(bun.globalPath.ROOT_PATH, "") + "/" + filename,
                name,
                context,
                type,
                ignore,
                isNecessary,
            });
            return;
        }
        // 命中ignore 则直接跳过
        if (ignore.indexOf(filename) !== -1) {
            return;
        }

        // 判断文件后缀
        if (!utils.isjs(filename)) {
            return;
        }

        const filePrefix = utils.getFilePrefix(filename);
        // name为*代表匹配目录下所有文件，否则匹配单个文件，如果匹配到具体name则结束文件遍历
        if (name !== "*.js") {
            if (filename !== name) {
                return;
            } else {
                key = _getFuncName(path, keypath, filePrefix);
                initModule(context, key, path + "/" + filePrefix, type);
                breaked = 1;
                return;
            }

        }
        key = _getFuncName(path, keypath, filePrefix);
        initModule(context, key, path + "/" + filePrefix, type);
    });
}
// 定义模块
function initModule(context: any, key: string, path: string, type?: string) {
    let mod: any;
    if (type === "async") {
        if (context[key]) {
            // 如果模块已存在作用域中，则报警并覆盖
            bun.Logger.bunwarn("bun-loader: Repeated method name: " + key + " in file: " + path);
        }
        /**
         * 这里使用Object.defineProperty实现异步调用模块，只当模块被调用时，才加载
         * 确保各个app业务代码互不影响，即使业务代码有异常，也不会影响其它app业务
         */
        Object.defineProperty(context, key, {
            get: () => {
                mod = loadModule(path);
                if (mod) {
                    return mod;
                }
                bun.Logger.bunwarn("bun-loader: module cannot find path is :" + path);
            },
            enumerable: true,
            configurable: false,
        });
        return;
    }
    mod = loadModule(path);
    if (mod) {
        context[key] = (() => {
            return mod;
        })();
    } else {
        bun.Logger.bunwarn("bun-loader: module cannot find path is :" + path);
    }
}

function loadModule(path: string): any {
    let mod: any;
    try {
        mod = require(path);
    } catch (e) {
        bun.Logger.bunerr("bun-loader: " + e);
    }
    return mod;
}

/**
 * 拼接方法名
 *
 * 规则：文件全路径-keypath
 * 如：path:app/example/action/api/home, keypath: app/example/
 * 则拼出来的方法名为：Action_Api_Home
 * @return string
 */
function _getFuncName(path: string, keypath: string, filePrefix?: any): string {
    let newpath = path.replace(bun.globalPath.ROOT_PATH, "");
    if (keypath === newpath) {
        newpath = "";
    } else {
        newpath = newpath.replace(keypath + "/", "");
    }

    const patharr = newpath.split("/");
    if (filePrefix) {
        patharr.push(filePrefix);
    }
    const arr = [];
    for (const item of patharr) {
        if (!item) {
            continue;
        }
        // 首字母大写
        arr.push(item.replace(/^\S/g, (s) => {
            return s.toUpperCase();
        }));
    }
    return arr.join("_");
}

export = loader;