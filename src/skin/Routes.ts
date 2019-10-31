import {
    IBun
} from "../types/Bun";
import { IContext } from "../types/interface";
import {
    IGETPOST,
    IRoutes, 
    IRoutesHandle
} from "../types/Routes";

export = (isSingle: boolean, globalPath: any): typeof IRoutes => {
    class Routes {
        public appName?: string;
        public routesHandle: IRoutesHandle;

        constructor(appName?: string) {
            this.appName = appName || "";
            this.routesHandle = {
                get: {},
                post: {},
            };
        }
        public get(obj: IGETPOST) {
            Object.entries(obj).forEach(([key, value]) => {
                // 直接添加route时 this.routes.get[this.appName][key] = this.initCallback(obj[key])
                const path = isSingle ? key : ("/" + this.appName + key);
                this.routesHandle.get[path] = this.initCallback(value);
            });
        }
        public post(obj: IGETPOST) {
            Object.entries(obj).forEach(([key, value]) => {
                const path = isSingle ? key : ("/" + this.appName + key);
                this.routesHandle.post[path] = this.initCallback(value);
            });
        }

        /**
         * merge routesHandle
         *
         * @pubilc
         * @params appRoutesHandle 要merge的路由处理对象
         */
        public mergeAppRoutes(appRoutesHandle: IRoutesHandle) {

            // 扩展routes
            const self = this;
            Object.entries(this.routesHandle).forEach(([method, value]) => {
                this.routesHandle[method as 'get' | 'post'] = Object.assign(
                    {},
                    value,
                    appRoutesHandle[method as 'get' | 'post'],
                );
            });
        }

        /**
         * 实例化每个请求回调
         *
         * @private
         * @params path 路由路径
         */
        private initCallback(path: string): any {
            const self = this;
            return async (ctx: IContext) => {
                const CbPath = isSingle ? path : ("/" + self.appName + path);
                const tplPath = isSingle ? '' : self.appName + "/";
                const Cb = require(globalPath.APP_PATH + CbPath);
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
    return Routes;
};