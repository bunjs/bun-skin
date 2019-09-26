import { Router } from "../interface";
class Routes {
    public appName?: string;
    public routesHandle: any;

    constructor(appName?: string) {
        this.appName = appName || "";
        this.routesHandle = {
            get: {},
            post: {},
        };
    }
    public get(obj: Router) {
        Object.entries(obj).forEach(([key, value]) => {
            // 直接添加route时 this.routes.get[this.appName][key] = this.initCallback(obj[key])
            const path = bun.isSingle ? key : ("/" + this.appName + key);
            this.routesHandle.get[path] = this.initCallback(value);
        });
    }
    public post(obj: Router) {
        Object.entries(obj).forEach(([key, value]) => {
            const path = bun.isSingle ? key : ("/" + this.appName + key);
            this.routesHandle.post[path] = this.initCallback(value);
        });
    }

    /**
     * merge routesHandle
     *
     * @pubilc
     * @params appRoutesHandle 要merge的路由处理对象
     */
    public mergeAppRoutes(appRoutesHandle: any) {

        // 扩展routes
        const self = this;
        Object.entries(this.routesHandle).forEach(([method, value]) => {
            this.routesHandle[method] = Object.assign(
                {},
                value,
                appRoutesHandle[method],
            );
        });
    }

    /**
     * 实例化每个请求回调
     *
     * @private
     * @params path 路由路径
     */
    private initCallback(path: string) {
        const self = this;
        return async (ctx: any) => {
            const CbPath = bun.isSingle ? path : ("/" + self.appName + path);
            const tplPath = bun.isSingle ? '' : self.appName + "/";
            const Cb = require(bun.globalPath.APP_PATH + CbPath);
            // 改变render指向，定向为当前应用目录
            const render = ctx.render;
            ctx.render = async (_path: string, params: any) => {
                await render(tplPath + _path, params);
            };
            // 改变renderHtml指向，定向为当前应用目录
            const renderHtml = ctx.renderHtml;
            ctx.renderHtml = async (_path: string, params: any) => {
                return await renderHtml(tplPath + _path, params);
            };
            // 每次请求都新建一个实例，保证不会互相污染
            const oCb = new Cb();
            oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
            await oCb.execute.call(oCb, ctx);
            oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
        };
    }
}
export = Routes;