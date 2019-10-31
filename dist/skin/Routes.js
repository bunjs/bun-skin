"use strict";
module.exports = (isSingle, globalPath) => {
    class Routes {
        constructor(appName) {
            this.appName = appName || "";
            this.routesHandle = {
                get: {},
                post: {},
            };
        }
        get(obj) {
            Object.entries(obj).forEach(([key, value]) => {
                const path = isSingle ? key : ("/" + this.appName + key);
                this.routesHandle.get[path] = this.initCallback(value);
            });
        }
        post(obj) {
            Object.entries(obj).forEach(([key, value]) => {
                const path = isSingle ? key : ("/" + this.appName + key);
                this.routesHandle.post[path] = this.initCallback(value);
            });
        }
        mergeAppRoutes(appRoutesHandle) {
            const self = this;
            Object.entries(this.routesHandle).forEach(([method, value]) => {
                this.routesHandle[method] = Object.assign({}, value, appRoutesHandle[method]);
            });
        }
        initCallback(path) {
            const self = this;
            return async (ctx) => {
                const CbPath = isSingle ? path : ("/" + self.appName + path);
                const tplPath = isSingle ? '' : self.appName + "/";
                const Cb = require(globalPath.APP_PATH + CbPath);
                const render = ctx.render;
                ctx.render = async (_path, params) => {
                    await render(tplPath + _path, params);
                };
                const renderHtml = ctx.renderHtml;
                ctx.renderHtml = async (_path, params) => {
                    return await renderHtml(tplPath + _path, params);
                };
                const oCb = new Cb();
                oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
                await oCb.execute.call(oCb, ctx);
                oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
            };
        }
    }
    return Routes;
};
//# sourceMappingURL=Routes.js.map