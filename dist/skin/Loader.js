"use strict";
const fs = require("fs");
const utils = require("./utils");
module.exports = (isSingle, Logger, globalPath) => {
    function getGlobalModuleByPath(loaderItem, appName) {
        const res = {};
        const appPath = isSingle ? '/app' : '/app/' + appName;
        const keypath = appPath;
        let { path, ignore, isRequired } = loaderItem;
        ignore = ignore || [];
        isRequired = isRequired || false;
        path = appPath + path;
        loader({ path, keypath, context: res, ignore, isRequired, isGetMap: true });
        return res;
    }
    const getGlobalModule = (loadList, appName) => {
        let map = {};
        loadList.forEach((item) => {
            map = Object.assign({}, map, getGlobalModuleByPath(item, appName || ''));
        });
        return map;
    };
    const loader = (obj) => {
        let { keypath, path, context, type, ignore, isRequired, isGetMap } = obj;
        keypath = keypath || '';
        context = context || global;
        type = type || "sync";
        ignore = ignore || [];
        isRequired = isRequired || false;
        isGetMap = isGetMap || false;
        path = globalPath.ROOT_PATH + path;
        let key;
        if (!utils.fsExistsSync(path)) {
            if (isRequired) {
                Logger.bunwarn("bun-loader: Loader not found " + path);
            }
            return;
        }
        const fstat = fs.lstatSync(path);
        if (fstat.isFile()) {
            key = getFuncName(path, keypath);
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
                loader({
                    keypath,
                    path: path.replace(globalPath.ROOT_PATH, "") + "/" + filename,
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
            key = getFuncName(path + '/' + filename, keypath);
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
                Logger.bunwarn("bun-loader: Repeated method name: " + key + " in file: " + path);
            }
            Object.defineProperty(context, key, {
                get: () => {
                    mod = loadModule(path);
                    if (mod) {
                        return mod;
                    }
                    Logger.bunwarn("bun-loader: module cannot find path is :" + path);
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
            Logger.bunwarn("bun-loader: module cannot find path is :" + path);
        }
    }
    function loadModule(path) {
        let mod;
        try {
            mod = require(path);
        }
        catch (e) {
            Logger.bunerr("bun-loader: " + e);
        }
        return mod;
    }
    const getFuncName = (path, keypath) => {
        let newpath = path.replace(globalPath.ROOT_PATH, "");
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
    return {
        getFuncName,
        loader,
        getGlobalModuleByPath,
        getGlobalModule
    };
};
//# sourceMappingURL=Loader.js.map