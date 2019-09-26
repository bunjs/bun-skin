"use strict";
const Koa = require("koa");
const path = require("path");
const config_1 = require("./config");
const emitter = require("./event.js");
const Loader_js_1 = require("./Loader.js");
const Logger = require("./Logger.js");
const Routes = require("./Routes.js");
const utils_1 = require("./utils");
class Bun extends Koa {
    constructor(name, options) {
        super();
        this.name = name;
        this.isSingle = !!options.isSingle;
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
    emitter(eventName, freeze) {
        if (freeze) {
            utils_1.deepFreeze(freeze);
        }
        emitter.emit(eventName, this);
    }
}
module.exports = Bun;
//# sourceMappingURL=Bun.js.map