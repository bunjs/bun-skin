"use strict";
const config_1 = require("./config");
const utils_1 = require("./utils");
const initAppClass = utils_1.curry((name) => {
    const classExtends = bun.lib.Common_Action;
    const routes = new bun.Routes(name);
    class App extends classExtends {
        constructor() {
            super();
            this.Routes = routes;
            this.appName = name || '';
        }
    }
    return {
        name: name || '',
        path: name ? ('/' + name) : '',
        class: App,
        router: routes,
    };
});
const registerConfFun = utils_1.curry((app) => {
    const context = app.class.prototype;
    const getConfPath = utils_1.curry((name, appendApp, filename) => {
        let path = bun.globalPath.CONF_PATH + app.path +
            (appendApp ? "/app/" : "/") + filename;
        const pos = filename.lastIndexOf(".");
        if (pos === -1) {
            path = path + ".js";
        }
        else {
            const filePostfix = filename.substr(pos + 1);
            if (filePostfix !== "js") {
                throw new Exception(Object.assign({}, config_1.err.ERROR_APP_CONNOT_LOAD_NOJS_FILE, { msg: "connot load ." + filePostfix + " please instead of .js" }));
            }
        }
        return path;
    });
    const getConf = utils_1.curry((path) => {
        const resJson = require(path);
        return resJson;
    });
    context.getAppConf = utils_1.run(getConf, getConfPath(app.name, true));
    context.getConf = utils_1.run(getConf, getConfPath(app.name, false));
    return app;
});
const registerRal = utils_1.curry((app) => {
    const context = app.class.prototype;
    const RAL = require('node-ral').RAL;
    const ralP = require('node-ral').RALPromise;
    const path = require('path');
    RAL.init({
        confDir: path.join(bun.globalPath.CONF_PATH, app.name + '/ral'),
        logger: {
            log_path: bun.globalPath.LOG_PATH + '/ral',
            app: 'bun-ral',
        },
    });
    context.ral = ralP;
    return app;
});
const registerAppAttributes = utils_1.curry((loaderListConf, app) => {
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
const runAppController = utils_1.curry((app) => {
    const Controller_Main = require(bun.globalPath.APP_PATH + app.path + "/controller/Main.js");
    const main = new Controller_Main();
    main.execute();
    return app;
});
const registerGlobalClass = utils_1.curry((app) => {
    if (bun.isSingle) {
        bun.class = app.class;
    }
    else {
        if (!bun.class) {
            bun.class = {
                [app.name]: app.class,
            };
        }
        else {
            bun.class[app.name] = app.class;
        }
    }
    return app;
});
module.exports = (appName) => {
    return utils_1.run(runAppController, registerGlobalClass, registerConfFun, registerAppAttributes(config_1.mvcLoaderList), initAppClass)(appName);
};
//# sourceMappingURL=InitApp.js.map