'use strict';

/**
 * @file Loader全局方法
 */

import fs = require('fs');
import { IBun } from '../types/Bun';
import utils = require('./utils');
export = (isSingle: boolean, Logger: any, globalPath: any): ILoader => {
    /**
     * 获取全局类的映射方法
     *
     * @param {string} appName 应用名
     * @param {object} loaderItem 要加载的全局模块的路径
     */
    function getGlobalModuleByPath(loaderItem: ILoaderParams, appName?: string) {
        const res: any = {};
        const appPath = isSingle ? '/app' : '/app/' + appName;
        const keypath = appPath;
        let { path, ignore, isRequired } = loaderItem;
        ignore = ignore || [];
        isRequired = isRequired || false;
        path = appPath + path;

        loader({ path, keypath, context: res, ignore, isRequired, isGetMap: true });
        return res;
    }

    /**
     * 获取全局类的映射方法
     *
     * @param {string} appName 应用名
     * @param {array} loadList 要加载的全局模块配置
     */
    const getGlobalModule = (loadList: any, appName?: string) => {
        let map: any = {};
        loadList.forEach((item: ILoaderParams) => {
            map = { ...map, ...getGlobalModuleByPath(item, appName || '') };
        });
        return map;
    };

    /**
     * Loader方法
     *
     * @param {string} keypath 模块命名时需要去除的路径
     * @param {string} path 要加载的路径
     * @param {string} context 声明上下文
     * @param {string} type 异步加载or同步加载
     * @param {array}  ignore 需要忽略的目录
     * @param {boolean} isRequired 是否必要
     * @param {boolean} isGetMap 是否只设置路径映射
     */
    const loader = (obj: ILoaderParams) => {
        let { keypath, path, context, type, ignore, isRequired, isGetMap } = obj;
        keypath = keypath || '';
        context = context || global;
        type = type || 'sync';
        ignore = ignore || [];
        isRequired = isRequired || false;
        isGetMap = isGetMap || false;
        path = globalPath.ROOT_PATH + path;

        let key: string;
        if (!utils.fsExistsSync(path)) {
            // 如果必要且找不到对应目录，则报警
            if (isRequired) {
                Logger.bunwarn('bun-loader: Loader not found ' + path);
            }
            return;
        }
        const fstat = fs.lstatSync(path);

        if (fstat.isFile()) {
            // 对文件进行直接引入操作
            key = getFuncName(path, keypath);
            if (isGetMap) {
                context[key] = path;
            } else {
                initModule(context, key, path, type);
            }
            return;
        }

        const files = fs.readdirSync(path);
        files.forEach((filename) => {
            const stat = fs.lstatSync(path + '/' + filename);
            if (stat.isDirectory()) {
                // 命中ignore 则直接跳过
                if (ignore.indexOf(filename + '/') !== -1) {
                    return;
                }
                // 是文件夹继续循环
                loader({
                    keypath,
                    path: path.replace(globalPath.ROOT_PATH, '') + '/' + filename,
                    context,
                    type,
                    ignore,
                    isRequired,
                    isGetMap
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

            key = getFuncName(path + '/' + filename, keypath);
            if (isGetMap) {
                context[key] = path + '/' + filename;
            } else {
                initModule(context, key, path + '/' + filename, type);
            }
        });
    };
    // 定义模块
    function initModule(context: any, key: string, path: string, type?: string) {
        let mod: any;
        if (type === 'async') {
            if (context[key]) {
                // 如果模块已存在作用域中，则报警并覆盖
                Logger.bunwarn('bun-loader: Repeated method name: ' + key + ' in file: ' + path);
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
                    Logger.bunwarn('bun-loader: module cannot find path is :' + path);
                },
                enumerable: true,
                configurable: false
            });
            return;
        }
        mod = loadModule(path);
        if (mod) {
            context[key] = (() => {
                return mod;
            })();
        } else {
            Logger.bunwarn('bun-loader: module cannot find path is :' + path);
        }
    }

    function loadModule(path: string): any {
        let mod: any;
        try {
            mod = require(path);
        } catch (e) {
            Logger.bunerr('bun-loader: ' + e);
        }
        return mod;
    }

    /**
     * 拼接方法名
     *
     * 规则：文件全路径-keypath
     * 如：path:app/example/action/api/home, keypath: app/example/
     * 则拼出来的方法名为：BUN_Action_Api_Home
     * @return string
     */
    const getFuncName = (path: string, keypath: string): string => {
        let newpath = path.replace(globalPath.ROOT_PATH, '');
        newpath = newpath.replace('.js', '');
        if (keypath === newpath) {
            newpath = '';
        } else {
            newpath = newpath.replace(keypath + '/', '');
        }

        const patharr = newpath.split('/');
        const arr = [];
        for (const item of patharr) {
            if (!item) {
                continue;
            }
            // 首字母大写
            arr.push(
                item.replace(/^\S/g, (s) => {
                    return s.toUpperCase();
                })
            );
        }
        return arr.join('_');
    };
    return {
        getFuncName,
        loader,
        getGlobalModuleByPath,
        getGlobalModule
    };
};
