import fs = require('fs');
import { IBun } from '../types/Bun';
import { err, mvcLoaderList } from './config';
import { curry, fsExistsSync, run } from './utils';
// import injectTapEventPlugin from 'react-tap-event-plugin';

/**
 * 初始化每个app的公共class（每个class的原型上注册对应的model方法）
 *
 * @private
 * @params appName app名称
 * @params route 路由
 */
const initAppClass = curry(
    (bun: IBun, name: string): IApp => {
        // 默认App继承Common_Action
        const classExtends = bun.lib.Common_Action;
        const Routes = bun.Routes;
        const routes = new Routes(name);
        class App extends classExtends {
            public Routes: any;
            public appName?: string;
            public getAppConf: (filename: string) => any;
            public getConf: (filename: string) => any;
            public ral?: Promise<any>;
            constructor() {
                super();
                // 单个app对应的route示例作为公共类的属性方便Controller类调用
                this.Routes = routes;
                this.appName = name || '';
            }
            public execute() {
                // dosomething
            }
        }
        return {
            name: name || '',
            path: name ? '/' + name : '',
            class: App,
            router: routes
        };
    }
);

/**
 * 为APP类添加conf方法
 *
 * app
 */
const registerConfFun = curry(
    (bun: IBun, app: IApp): IApp => {
        const context = app.class.prototype;
        const getConfPath = curry((name: string, appendApp: boolean, filename: string) => {
            let path = bun.globalPath.CONF_PATH + app.path + (appendApp ? '/app/' : '/') + filename;
            const pos = filename.lastIndexOf('.');
            if (pos === -1) {
                path = path + '.js';
            } else {
                const filePostfix = filename.substr(pos + 1);
                if (filePostfix !== 'js') {
                    throw new bun.Exception({
                        ...err.ERROR_APP_CONNOT_LOAD_NOJS_FILE,
                        ...{ msg: 'connot load .' + filePostfix + ' please instead of .js' }
                    });
                }
            }
            return path;
        });
        const getConf = curry((path: string) => {
            const resJson = require(path);
            return resJson;
        });
        context.getAppConf = run(getConf, getConfPath(app.name, true));
        context.getConf = run(getConf, getConfPath(app.name, false));
        return app;
    }
);

/**
 * 添加ral方法
 *
 * app
 */
const registerRal = curry(
    (bun: IBun, app: IApp): IApp => {
        const context = app.class.prototype;
        const RAL = require('node-ral').RAL;
        const ralP = require('node-ral').RALPromise;
        const path = require('path');

        // 初始化RAL，只需在程序入口运行一次
        RAL.init({
            // 指定RAL配置目录
            confDir: path.join(bun.globalPath.CONF_PATH, app.name + '/ral'),
            logger: {
                log_path: bun.globalPath.LOG_PATH + '/ral',
                app: 'bun-ral'
                // logInstance: function (options) {
                //     return {
                //         notice: function (msg) {
                //             bun.Logger.ralnotice(msg);
                //         },
                //         warning: function (msg) {
                //             bun.Logger.ralwarning(msg);
                //         },
                //         trace: function (msg) {
                //             bun.Logger.raltrace(msg);
                //         },
                //         fatal: function (msg) {
                //             bun.Logger.ralfatal(msg);
                //         },
                //         debug: function (msg) {
                //             bun.Logger.raldebug(msg);
                //         }
                //     }
                // }
            }
        });
        context.ral = ralP;
        return app;
    }
);

/**
 * 需要特定引入到app类里作为属性的部分模块
 * 匹配规则为路径匹配，例如：
 * action：Action_Show_Home
 * model：Services_Data_ApiData
 *
 */
const registerAppAttributes = curry(
    (bun: IBun, loaderListConf: any, app: IApp): IApp => {
        let appLoaderConf = [];
        const appLoaderConfPath = bun.globalPath.CONF_PATH + app.path + '/globalLoader';
        if (fsExistsSync(appLoaderConfPath)) {
            appLoaderConf = require(appLoaderConfPath);
        }

        [...appLoaderConf, ...loaderListConf].map((loaderConf) => {
            bun.Loader.loader({
                keypath: '/app' + app.path,
                path: '/app' + app.path + loaderConf.path,
                context: app.class.prototype,
                type: 'async',
                isRequired: loaderConf.isRequired
            });
        });
        return app;
    }
);

/**
 * 赋值给实例bun
 *
 * @private
 * @params bun: IBun, app: IApp
 */
const setBun = curry(
    (bun: IBun, app: IApp): IApp => {
        if (!app.name) {
            // name为空则走single逻辑
            (bun.app as IApp) = app;
        } else {
            (bun.apps as IApps)[app.name] = app;
        }
        return app;
    }
);

/**
 * 执行每个app的controller
 *
 * @private
 * @params appName app名称
 */
const runAppController = curry(
    (bun: IBun, app: IApp): IApp => {
        const Controller_Main = require(bun.globalPath.APP_PATH + app.path + '/controller/Main.js');
        const main = new Controller_Main();
        main.execute();
        return app;
    }
);

export = (bun: IBun, appName: string): IApp => {
    return run(
        runAppController(bun),
        setBun(bun),
        // registerGlobalClass(bun),
        // registerRal(bun),
        registerConfFun(bun),
        registerAppAttributes(bun, mvcLoaderList),
        initAppClass(bun)
    )(appName);
};
