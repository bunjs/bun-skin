"use strict";
class Routes {
    constructor(appName) {
        this.appName = appName || "";
        this.routesHandle = {
            get: {},
            post: {},
        };
    }
    get(obj) {
        for (const [key, value] of Object.entries(obj)) {
            this.routesHandle.get["/" + this.appName + key] = this.initCallback(value);
        }
    }
    post(obj) {
        for (const [key, value] of Object.entries(obj)) {
            this.routesHandle.post["/" + this.appName + key] = this.initCallback(value);
        }
    }
    mergeAppRoutes(appRoutesHandle) {
        const self = this;
        for (const [method, value] of Object.entries(this.routesHandle)) {
            this.routesHandle[method] = Object.assign({}, value, appRoutesHandle[method]);
        }
    }
    initCallback(path) {
        const self = this;
        return async (ctx) => {
            const Cb = require(bun.globalPath.APP_PATH + "/" + self.appName + path);
            const render = ctx.render;
            ctx.render = async (_path, params) => {
                await render(self.appName + "/" + _path, params);
            };
            const renderHtml = ctx.renderHtml;
            ctx.renderHtml = async (_path, params) => {
                return await renderHtml(self.appName + "/" + _path, params);
            };
            const oCb = new Cb();
            oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
            await oCb.execute.call(oCb, ctx);
            oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
        };
    }
}
module.exports = Routes;
//# sourceMappingURL=Routes.js.map