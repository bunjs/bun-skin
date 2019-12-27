"use strict";
const Koa = require("koa");
const path = require("path");
const config_1 = require("./config");
const core = require("./Core");
const emitter = require("./event");
const exception = require("./Exception");
const Loader = require("./Loader");
const Logger = require("./Logger");
const routes = require("./Routes");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
class Bun extends Koa {
    constructor(name, options) {
        super();
        this.name = name;
        this.isSingle = !!options.isSingle;
        this.context.app = this;
        this.port = options.port || 8000;
        const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
        this.globalPath = Object.assign({}, config_1.globalPath(rootPath));
        this.Logger = Logger(this.globalPath.LOG_PATH);
        this.Loader = Loader(this.isSingle, this.Logger, this.globalPath);
        this.Routes = routes(this.isSingle, this.globalPath);
        this.Exception = exception(this);
        this.plugins = {};
        this.apps = {};
        this.lib = {};
        this.globalModule = {};
        const Module = require('module');
        Module._extensions['.less'] = (module, fn) => {
            return '';
        };
        Module._extensions['.css'] = (module, fn) => {
            return '';
        };
    }
    emitter(eventName, freeze) {
        if (freeze) {
            utils_1.deepFreeze(freeze);
        }
        emitter.emit(eventName, this);
    }
    bootstrap() {
        try {
            utils_2.run(core.start(this.port), core.setPlugins, core.setRouter, core.initAllApps, core.setLib, core.setViews, core.setBodyParser, core.setServerStaic, core.setRal, core.setReqLog, core.setErrHandle, core.setContext)(this);
        }
        catch (e) {
            this.Logger.bunerr(e);
        }
    }
}
module.exports = Bun;
//# sourceMappingURL=Bun.js.map