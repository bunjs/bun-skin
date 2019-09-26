"use strict";
const fs = require("fs");
const bodyParser = require("koa-bodyparser");
const serverStaic = require("koa-static");
const config_1 = require("./config");
const config_2 = require("./config");
const Exception = require("./Exception.js");
const initApp = require("./InitApp.js");
const Loader_js_1 = require("./Loader.js");
const catchError = require("./middleware/bun_catch_error.js");
const ral = require("./middleware/bun_ral.js");
const router = require("./middleware/bun_router.js");
const views = require("./middleware/bun_view.js");
const Plugin = require("./Plugin.js");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
module.exports = {
    setException: utils_2.curry((bun) => {
        global.Exception = Exception;
        bun.emitter("setException");
        return bun;
    }),
    setGlobalModule: utils_2.curry((bun) => {
        if (bun.isSingle) {
            let loaderList = [...config_2.mvcLoaderList];
            try {
                const appLoaderConf = require(bun.globalPath.CONF_PATH + '/globalLoader');
                loaderList = [...config_2.mvcLoaderList, ...appLoaderConf];
            }
            catch (e) {
                bun.Logger.bunwarn("App globalLoader not found ");
            }
            Loader_js_1.getGlobalModule(loaderList, '');
        }
        else {
            const files = fs.readdirSync(bun.globalPath.ROOT_PATH + "/app");
            files.forEach((filename) => {
                const stat = fs.lstatSync(bun.globalPath.ROOT_PATH + "/app" + "/" + filename);
                if (stat.isDirectory()) {
                    let loaderList = [...config_2.mvcLoaderList];
                    try {
                        const appLoaderConf = require(bun.globalPath.CONF_PATH + '/' + filename + '/globalLoader');
                        loaderList = [...config_2.mvcLoaderList, ...appLoaderConf];
                    }
                    catch (e) {
                        bun.Logger.bunwarn('App ' + filename + " globalLoader not found ");
                    }
                    Loader_js_1.getGlobalModule(loaderList, filename);
                }
            });
        }
        const Module = require("module");
        function stripBOM(content) {
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        }
        Module._extensions['.js'] = function (module, filename) {
            let content = fs.readFileSync(filename, 'utf8');
            let regExp = new RegExp(bun.globalPath.ROOT_PATH + (bun.isSingle ? '/app/.*' : '/app/(.*?)/.*'));
            if (filename.indexOf('/node_modules') === -1
                && filename.match(regExp)) {
                let appName = bun.isSingle ? '' : RegExp.$1;
                let globalModule = bun.isSingle ? bun.globalModule : bun.globalModule[RegExp.$1];
                if (!globalModule) {
                    module._compile(stripBOM(content), filename);
                    return;
                }
                let currentKey = Loader_js_1.getFuncName(filename.replace('.js', ''), bun.isSingle ? '/app' : '/app/' + appName);
                let str = '';
                Object.entries(globalModule).forEach(([key, value]) => {
                    if (key === currentKey || content.indexOf(key) === -1) {
                        return;
                    }
                    str += 'const ' + key + ' = require("' + value + '");\n';
                });
                content = str + '\n' + content;
            }
            module._compile(stripBOM(content), filename);
        };
        bun.emitter("setGlobalModule");
        return bun;
    }),
    initAllApps: utils_2.curry((bun) => {
        bun.app = {};
        if (bun.isSingle) {
            bun.app = initApp('');
        }
        else {
            const files = fs.readdirSync(bun.globalPath.ROOT_PATH + "/app");
            files.forEach((filename) => {
                const stat = fs.lstatSync(bun.globalPath.ROOT_PATH + "/app" + "/" + filename);
                if (stat.isDirectory()) {
                    bun.app[filename] = initApp(filename);
                }
            });
        }
        bun.emitter("initApp", bun.app);
        return bun;
    }),
    setLib: utils_2.curry((bun) => {
        bun.Loader({
            keypath: "lib",
            path: "/lib",
            context: bun.lib
        });
        bun.emitter("setLib", bun.lib);
        return bun;
    }),
    setPlugins: utils_2.curry((bun) => {
        Plugin();
        bun.emitter("setPlugins", bun.plugins);
        return bun;
    }),
    setRouter: utils_2.curry((bun) => {
        const routes = new bun.Routes();
        if (bun.isSingle) {
            routes.mergeAppRoutes(bun.app.router.routesHandle);
        }
        else {
            Object.entries(bun.app).forEach(([key, value]) => {
                routes.mergeAppRoutes(value.router.routesHandle);
            });
        }
        bun.use(router(routes.routesHandle));
        bun.emitter("setRouter");
        return bun;
    }),
    setReqLog: utils_2.curry((bun) => {
        bun.use(bun.Logger.log4js.koaLogger(bun.Logger.reqLog(), {
            format: "[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]",
            level: "auto",
        }));
        bun.emitter("setReqLog");
        return bun;
    }),
    setServerStaic: utils_2.curry((bun) => {
        bun.use(serverStaic(bun.globalPath.STATIC_PATH));
        bun.emitter("setServerStaic");
        return bun;
    }),
    setBodyParser: utils_2.curry((bun) => {
        bun.use(bodyParser());
        bun.emitter("setBodyParser");
        return bun;
    }),
    setViews: utils_2.curry((bun) => {
        bun.use(views(bun.globalPath.TPL_PATH, {
            ext: config_1.viewExt,
        }));
        bun.emitter("setViews");
        return bun;
    }),
    setErrHandle: utils_2.curry((bun) => {
        bun.use(catchError);
        return bun;
    }),
    setRal: utils_2.curry((bun) => {
        bun.use(ral);
        bun.emitter("setRal");
        return bun;
    }),
    start: utils_2.curry((port, bun) => {
        bun.listen(port);
        utils_1.deepFreeze(bun, "context");
        console.log("start on" + port);
        return bun;
    })
};
//# sourceMappingURL=Core.js.map