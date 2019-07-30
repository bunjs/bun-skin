"use strict";
const fs = require("fs");
const utils = require("./utils");
function loader(obj) {
    let { keypath, path, name, context, type, ignore, isNecessary } = obj;
    keypath = keypath || '';
    name = name || "*";
    context = context || global;
    type = type || "sync";
    ignore = ignore || [];
    isNecessary = isNecessary || false;
    path = bun.globalPath.ROOT_PATH + path;
    let key;
    if (!utils.fsExistsSync(path)) {
        if (isNecessary) {
            bun.Logger.bunwarn("bun-loader: Loader not found " + path);
        }
        return;
    }
    const fstat = fs.lstatSync(path);
    if (fstat.isFile()) {
        key = _getFuncName(path, keypath);
        initModule(context, key, path, type);
        return;
    }
    if (name.lastIndexOf(".") === -1) {
        name = name + ".js";
    }
    const files = fs.readdirSync(path);
    let breaked = 0;
    files.forEach((filename) => {
        if (breaked === 1) {
            return;
        }
        const stat = fs.lstatSync(path + "/" + filename);
        if (stat.isDirectory()) {
            if (ignore.indexOf(filename + "/") !== -1) {
                return;
            }
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
        if (ignore.indexOf(filename) !== -1) {
            return;
        }
        if (!utils.isjs(filename)) {
            return;
        }
        const filePrefix = utils.getFilePrefix(filename);
        if (name !== "*.js") {
            if (filename !== name) {
                return;
            }
            else {
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
function initModule(context, key, path, type) {
    let mod;
    if (type === "async") {
        if (context[key]) {
            bun.Logger.bunwarn("bun-loader: Repeated method name: " + key + " in file: " + path);
        }
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
    }
    else {
        bun.Logger.bunwarn("bun-loader: module cannot find path is :" + path);
    }
}
function loadModule(path) {
    let mod;
    try {
        mod = require(path);
    }
    catch (e) {
        bun.Logger.bunerr("bun-loader: " + e);
    }
    return mod;
}
function _getFuncName(path, keypath, filePrefix) {
    let newpath = path.replace(bun.globalPath.ROOT_PATH, "");
    if (keypath === newpath) {
        newpath = "";
    }
    else {
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
        arr.push(item.replace(/^\S/g, (s) => {
            return s.toUpperCase();
        }));
    }
    return arr.join("_");
}
module.exports = loader;
//# sourceMappingURL=Loader.js.map