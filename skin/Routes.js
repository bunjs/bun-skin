
class Routes {
    constructor(appName) {
        this.appName = appName || '';
        this.routesHandle = {
            get: {},
            post: {}
        };
    }
    get(obj) {
        for (let [key, value] of Object.entries(obj)) {
            // 直接添加route时 this.routes.get[this.appName][key] = this.initCallback(obj[key])
            this.routesHandle.get['/' + this.appName + key] = this.initCallback(value);
        }
    }
    post(obj) {
        for (let [key, value] of Object.entries(obj)) {
            this.routesHandle.post['/' + this.appName + key] = this.initCallback(value);
        }
    }

    /**
     * 实例化每个请求回调
     * 
     * @private
     * @params path 路由路径
     */
    initCallback(path) {
        let self = this;
        return async function (ctx) {
            let Cb = require(bun.APP_PATH + '/' + self.appName + path);
            // 改变render指向，定向为当前应用目录
            let render = ctx.render;
            ctx.render = async function(path, params) {
                await render(self.appName + '/' + path, params);
            };
            // 改变renderHtml指向，定向为当前应用目录
            let renderHtml = ctx.renderHtml;
            ctx.renderHtml = async function(path, params) {
                return await renderHtml(self.appName + '/' + path, params);
            };
            // 每次请求都新建一个实例，保证不会互相污染
            let oCb = new Cb();
            oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
            await oCb.execute.call(oCb, ctx);
            oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
        }
    }

    /**
     * merge routesHandle
     * 
     * @pubilc
     * @params appRoutesHandle 要merge的路由处理对象
     */
    mergeAppRoutes(appRoutesHandle) {

        // 扩展routes
        let self = this;
        for (let [method, value] of Object.entries(this.routesHandle)) {
            this.routesHandle[method] = Object.assign(
                {},
                value,
                appRoutesHandle[method]
            );
        }
    }
}
module.exports = Routes;