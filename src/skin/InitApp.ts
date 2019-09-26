import fs = require("fs");
import { err, mvcLoaderList } from "./config";
import { curry, run } from "./utils";
// import injectTapEventPlugin from 'react-tap-event-plugin';

/**
 * 初始化每个app的公共class（每个class的原型上注册对应的model方法）
 *
 * @private
 * @params appName app名称
 * @params route 路由
 */
const initAppClass = curry((name: string) => {
    // 默认App继承Common_Action
    const classExtends = bun.lib.Common_Action;
    const routes = new bun.Routes(name);
    abstract class App extends classExtends {
        public Routes: any;
        public appName?: string;
        constructor() {
            super();
            // 单个app对应的route示例作为公共类的属性方便Controller类调用
            this.Routes = routes;
            this.appName = name || '';
        }
        public abstract execute(): any;
    }
    return {
        name: name || '',
        path: name ? ('/' + name) : '',
        class: App,
        router: routes,
    };
});

/**
 * 为APP类添加conf方法
 *
 * app
 */
const registerConfFun = curry((app: any) => {
    const context = app.class.prototype;
    const getConfPath = curry((name: string, appendApp: boolean, filename: string) => {
        let path = bun.globalPath.CONF_PATH + app.path +
            (appendApp ? "/app/" : "/") + filename;
        const pos = filename.lastIndexOf(".");
        if (pos === -1) {
            path = path + ".js";
        } else {
            const filePostfix = filename.substr(pos + 1);
            if (filePostfix !== "js") {
                throw new Exception({
                    ...err.ERROR_APP_CONNOT_LOAD_NOJS_FILE,
                    ...{ msg: "connot load ." + filePostfix + " please instead of .js"},
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
});

/**
 * 添加ral方法
 * 
 * app
 */
const registerRal = curry((app: any) => {
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
            app: 'bun-ral',
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
        },
    });
    context.ral = ralP;
    return app;
});

/**
 * 需要特定引入到app类里作为属性的部分模块
 * 匹配规则为路径匹配，例如：
 * action：Action_Show_Home
 * model：Services_Data_ApiData
 *
 */
const registerAppAttributes = curry((loaderListConf: any, app: any) => {
    const appLoaderConf = require(bun.globalPath.CONF_PATH + app.path + '/globalLoader');
    [...appLoaderConf, ...loaderListConf].map((loaderConf) => {
        bun.Loader({
            keypath: '/app' + app.path,
            path: '/app' + app.path + loaderConf.path,
            context: app.class.prototype,
            type: "async",
            isRequired: loaderConf.isRequired,
        });
    });
    return app;
});

/**
 * 执行每个app的controller
 *
 * @private
 * @params appName app名称
 */
const runAppController = curry((app: any) => {
    const Controller_Main = require(bun.globalPath.APP_PATH + app.path + "/controller/Main.js");
    const main = new Controller_Main();
    main.execute();
    return app;
});

// app公共类附在全局bun上，方便继承
// 加一层class命名空间是担心用户app命名与bun自由属性冲突
const registerGlobalClass = curry((app: any) => {
    if (bun.isSingle) {
        bun.class = app.class;
    } else {
        if (!bun.class) {
            bun.class = {
                [app.name]: app.class,
            };
        } else {
            bun.class[app.name] = app.class;
        }
    }
    return app;
});

export = (appName: string) => {
    return run(
        runAppController,
        registerGlobalClass,
        // registerRal,
        registerConfFun,
        registerAppAttributes(mvcLoaderList),
        initAppClass,
    )(appName);
};