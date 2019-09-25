"use strict";
const fs = require("fs");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const serverStaic = require("koa-static");
const path = require("path");
const config_1 = require("./config");
const config_2 = require("./config");
const emitter = require("./event.js");
const Exception = require("./Exception.js");
const initApp = require("./InitApp.js");
const Loader_js_1 = require("./Loader.js");
const Logger = require("./Logger.js");
const catchError = require("./middleware/bun_catch_error.js");
const ral = require("./middleware/bun_ral.js");
const router = require("./middleware/bun_router.js");
const views = require("./middleware/bun_view.js");
const Plugin = require("./Plugin.js");
const Routes = require("./Routes.js");
const utils_1 = require("./utils");
class Bun extends Koa {
    constructor(name, options) {
        super();
        this.name = name;
        this.context.app = this;
        const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
        this.globalPath = {};
        Object.assign(this.globalPath, config_1.globalPath(rootPath));
        this.Logger = Logger(this.globalPath.LOG_PATH);
        this.Loader = Loader_js_1.loader;
        this.Routes = Routes;
        this.events = emitter;
        this.plugins = {};
        this.lib = {};
        this.globalModule = {};
        const Module = require("module");
        Module._extensions[".less"] = (module, fn) => {
            return "";
        };
        Module._extensions[".css"] = (module, fn) => {
            return "";
        };
        Object.freeze(bun);
    }
    setException() {
        global.Exception = Exception;
        this.emitter("setException");
    }
    setGlobalModule() {
        const files = fs.readdirSync(this.globalPath.ROOT_PATH + "/app");
        files.forEach((filename) => {
            const stat = fs.lstatSync(this.globalPath.ROOT_PATH + "/app" + "/" + filename);
            if (stat.isDirectory()) {
                let loaderList = [...config_2.mvcLoaderList];
                try {
                    const appLoaderConf = require(this.globalPath.CONF_PATH + '/' + filename + '/globalLoader');
                    loaderList = [...config_2.mvcLoaderList, ...appLoaderConf];
                }
                catch (e) {
                    bun.Logger.bunwarn('App ' + filename + " globalLoader not found ");
                }
                Loader_js_1.getGlobalModule(filename, loaderList);
            }
        });
        const Module = require("module");
        function stripBOM(content) {
            if (content.charCodeAt(0) === 0xFEFF) {
                content = content.slice(1);
            }
            return content;
        }
        Module._extensions['.js'] = function (module, filename) {
            let content = fs.readFileSync(filename, 'utf8');
            let regExp = new RegExp(bun.globalPath.ROOT_PATH + '/app/(.*?)/.*');
            if (filename.indexOf('/node_modules') === -1
                && filename.match(regExp)) {
                let appName = RegExp.$1;
                if (!bun.globalModule[appName]) {
                    module._compile(stripBOM(content), filename);
                    return;
                }
                let currentKey = Loader_js_1.getFuncName(filename.replace('.js', ''), '/app/' + appName);
                let str = '';
                for (const [key, value] of Object.entries(bun.globalModule[appName])) {
                    if (key === currentKey || content.indexOf(key) === -1) {
                        continue;
                    }
                    str += 'const ' + key + ' = require("' + value + '");\n';
                }
                content = str + '\n' + content;
            }
            module._compile(stripBOM(content), filename);
        };
        this.emitter("setGlobalModule");
    }
    initAllApps() {
        let routes = {};
        this.app = {};
        const files = fs.readdirSync(this.globalPath.ROOT_PATH + "/app");
        files.forEach((filename) => {
            const stat = fs.lstatSync(this.globalPath.ROOT_PATH + "/app" + "/" + filename);
            if (stat.isDirectory()) {
                routes = new this.Routes(filename);
                this.app[filename] = initApp(filename);
            }
        });
        this.emitter("initApp", this.app);
    }
    setLib() {
        this.Loader({
            keypath: "lib",
            path: "/lib",
            context: this.lib
        });
        this.emitter("setLib", this.lib);
    }
    setPlugins() {
        Plugin();
        this.emitter("setPlugins", this.plugins);
    }
    setRouter() {
        const routes = new this.Routes();
        for (const [key, value] of Object.entries(this.app)) {
            routes.mergeAppRoutes(value.router.routesHandle);
        }
        this.use(router(routes.routesHandle));
        this.emitter("setRouter");
    }
    setReqLog() {
        this.use(this.Logger.log4js.koaLogger(this.Logger.reqLog(), {
            format: "[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]",
            level: "auto",
        }));
        this.emitter("setReqLog");
    }
    setServerStaic() {
        this.use(serverStaic(this.globalPath.STATIC_PATH));
        this.emitter("setServerStaic");
    }
    setBodyParser() {
        this.use(bodyParser());
        this.emitter("setBodyParser");
    }
    setViews() {
        this.use(views(this.globalPath.TPL_PATH, {
            ext: config_1.viewExt,
        }));
        this.emitter("setViews");
    }
    setErrHandle() {
        this.use(catchError);
    }
    setRal() {
        this.use(ral);
        this.emitter("setRal");
    }
    run(port = config_1.defaultPort) {
        this.listen(port);
        utils_1.deepFreeze(bun, "context");
        console.log("start on" + port);
    }
    emitter(eventName, freeze) {
        if (freeze) {
            utils_1.deepFreeze(freeze);
        }
        emitter.emit(eventName, this);
    }
}
module.exports = Bun;
//# sourceMappingURL=Core.js.map