"use strict";
const config_1 = require("./config");
const utils_1 = require("./utils");
const initAppClass = utils_1.curry((bun, name) => {
    const classExtends = bun.lib.Common_Action;
    const Routes = bun.Routes;
    const routes = new Routes(name);
    class App extends classExtends {
        constructor() {
            super();
            this.Routes = routes;
            this.appName = name || '';
        }
        execute() {
        }
    }
    return {
        name: name || '',
        path: name ? '/' + name : '',
        class: App,
        router: routes
    };
});
const registerConfFun = utils_1.curry((bun, app) => {
    const context = app.class.prototype;
    const getConfPath = utils_1.curry((name, appendApp, filename) => {
        let path = bun.globalPath.CONF_PATH + app.path + (appendApp ? '/app/' : '/') + filename;
        const pos = filename.lastIndexOf('.');
        if (pos === -1) {
            path = path + '.js';
        }
        else {
            const filePostfix = filename.substr(pos + 1);
            if (filePostfix !== 'js') {
                throw new bun.Exception(Object.assign({}, config_1.err.ERROR_APP_CONNOT_LOAD_NOJS_FILE, { msg: 'connot load .' + filePostfix + ' please instead of .js' }));
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
const registerRal = utils_1.curry((bun, app) => {
    const context = app.class.prototype;
    const RAL = require('node-ral').RAL;
    const ralP = require('node-ral').RALPromise;
    const path = require('path');
    RAL.init({
        confDir: path.join(bun.globalPath.CONF_PATH, app.name + '/ral'),
        logger: {
            log_path: bun.globalPath.LOG_PATH + '/ral',
            app: 'bun-ral'
        }
    });
    context.ral = ralP;
    return app;
});
const registerAppAttributes = utils_1.curry((bun, loaderListConf, app) => {
    let appLoaderConf = [];
    const appLoaderConfPath = bun.globalPath.CONF_PATH + app.path + '/globalLoader';
    if (utils_1.fsExistsSync(appLoaderConfPath)) {
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
});
const setBun = utils_1.curry((bun, app) => {
    if (!app.name) {
        bun.app = app;
    }
    else {
        bun.apps[app.name] = app;
    }
    return app;
});
const runAppController = utils_1.curry((bun, app) => {
    const Controller_Main = require(bun.globalPath.APP_PATH + app.path + '/controller/Main.js');
    const main = new Controller_Main();
    main.execute();
    return app;
});
module.exports = (bun, appName) => {
    return utils_1.run(runAppController(bun), setBun(bun), registerConfFun(bun), registerAppAttributes(bun, config_1.mvcLoaderList), initAppClass(bun))(appName);
};
//# sourceMappingURL=InitApp.js.map