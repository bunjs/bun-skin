class Routes {
    constructor(appName) {
        this.appName = appName || '';
        this.routes = {
            get: {},
            post: {}
        };
    }
    get(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.routes.get[key] = this.initCallback(obj[key])
            }
        }
    }
    post(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.routes.post[key] = this.initCallback(obj[key])
            }
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
            var oCb = new Cb();
            await oCb.execute.call(oCb, ctx);
        }
    }
    mergeAppRoutes(path, approutes) {
        // 扩展routes
        let self = this;
        for (let i in approutes) {
            if (approutes.hasOwnProperty(i)) {
                _extend(i, approutes[i])
            }
        }

        function _extend(method, routes) {
            for (let i in routes) {
                if (routes.hasOwnProperty(i)) {
                    self.routes[method][path + i] = routes[i];
                }
            }
        }
    }

    /**
     * @public
     * router中间件入口方法
     */
    async routerMiddleware(ctx, next) {
        // 中间件
        let url = ctx.request.path
        await this.routingMethodExecution(url, ctx)
        return next()
    }

    /**
     * @private
     * route中间件处理主方法
     */
    async routingMethodExecution(url, ctx) {

        if (ctx.method === 'GET') {
            if (!this.routes.get[url]) {
                let apppathar = url.split('/');
                // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/*，再匹配/*
                for (let i = apppathar.length; i > 1; i--) {
                    let apppath = apppathar.slice(0, i).join('/') + '/*';
                    if (this.routes.get[apppath] && typeof this.routes.get[apppath] === 'function') {
                        await this.routes.get[apppath](ctx);
                        return;
                    }
                }
                await goNotfound();
                return;
            }
            else if (typeof this.routes.get[url] !== 'function') {
                await goNotfound();
                return;
            }
            await this.routes.get[url](ctx);
        } else if (ctx.method === 'POST') {
            if (!this.routes.post[url] || typeof this.routes.post[url] !== 'function') {
                await goNotfound();
                return;
            }
            await this.routes.post[url](ctx);
        } else {
            ctx.throw(404, 'connot found')
        }
        async function goNotfound() {
            let Cb = require(bun.APP_PATH + '/404.js');
            let oCb = new Cb();
            await oCb.execute.call(oCb, ctx);
        }
    }
}
module.exports = Routes;