"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const utils = require("./utils");
function getGlobalModuleByPath(loaderItem, appName) {
    const res = {};
    const appPath = bun.isSingle ? '/app' : '/app/' + appName;
    const keypath = appPath;
    let { path, ignore, isRequired } = loaderItem;
    ignore = ignore || [];
    isRequired = isRequired || false;
    path = appPath + path;
    exports.loader({ path, keypath, context: res, ignore, isRequired, isGetMap: true });
    return res;
}
exports.getGlobalModule = (loadList, appName) => {
    let map = {};
    loadList.forEach((item) => {
        map = Object.assign({}, map, getGlobalModuleByPath(item, appName || ''));
    });
    if (appName) {
        bun.globalModule[appName] = map;
    }
    else {
        bun.globalModule = map;
    }
};
exports.loader = (obj) => {
    let { keypath, path, context, type, ignore, isRequired, isGetMap } = obj;
    keypath = keypath || '';
    context = context || global;
    type = type || "sync";
    ignore = ignore || [];
    isRequired = isRequired || false;
    isGetMap = isGetMap || false;
    path = bun.globalPath.ROOT_PATH + path;
    let key;
    if (!utils.fsExistsSync(path)) {
        if (isRequired) {
            bun.Logger.bunwarn("bun-loader: Loader not found " + path);
        }
        return;
    }
    const fstat = fs.lstatSync(path);
    if (fstat.isFile()) {
        key = exports.getFuncName(path, keypath);
        if (isGetMap) {
            context[key] = path;
        }
        else {
            initModule(context, key, path, type);
        }
        return;
    }
    const files = fs.readdirSync(path);
    files.forEach((filename) => {
        const stat = fs.lstatSync(path + "/" + filename);
        if (stat.isDirectory()) {
            if (ignore.indexOf(filename + "/") !== -1) {
                return;
            }
            exports.loader({
                keypath,
                path: path.replace(bun.globalPath.ROOT_PATH, "") + "/" + filename,
                context,
                type,
                ignore,
                isRequired,
                isGetMap
            });
            return;
        }
        if (ignore.indexOf(filename) !== -1) {
            return;
        }
        if (!utils.isjs(filename)) {
            return;
        }
        key = exports.getFuncName(path + '/' + filename, keypath);
        if (isGetMap) {
            context[key] = path + "/" + filename;
        }
        else {
            initModule(context, key, path + "/" + filename, type);
        }
    });
};
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
exports.getFuncName = (path, keypath) => {
    let newpath = path.replace(bun.globalPath.ROOT_PATH, "");
    newpath = newpath.replace('.js', "");
    if (keypath === newpath) {
        newpath = "";
    }
    else {
        newpath = newpath.replace(keypath + "/", "");
    }
    const patharr = newpath.split("/");
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
};
//# sourceMappingURL=Loader.js.map