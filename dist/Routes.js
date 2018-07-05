'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
                this.routes.get[key] = this.initCallback(obj[key]);
            }
        }
    }
    post(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.routes.post[key] = this.initCallback(obj[key]);
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
        return (() => {
            var _ref = _asyncToGenerator(function* (ctx) {
                let Cb = require(bun.APP_PATH + '/' + self.appName + path);
                // 改变render指向，定向为当前应用目录
                let render = ctx.render;
                ctx.render = (() => {
                    var _ref2 = _asyncToGenerator(function* (path, params) {
                        yield render(self.appName + '/' + path, params);
                    });

                    return function (_x2, _x3) {
                        return _ref2.apply(this, arguments);
                    };
                })();
                // 改变renderHtml指向，定向为当前应用目录
                let renderHtml = ctx.renderHtml;
                ctx.renderHtml = (() => {
                    var _ref3 = _asyncToGenerator(function* (path, params) {
                        return yield renderHtml(self.appName + '/' + path, params);
                    });

                    return function (_x4, _x5) {
                        return _ref3.apply(this, arguments);
                    };
                })();
                var oCb = new Cb();
                yield oCb.execute.call(oCb, ctx);
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })();
    }
    mergeAppRoutes(path, approutes) {
        // 扩展routes
        let self = this;
        for (let i in approutes) {
            if (approutes.hasOwnProperty(i)) {
                _extend(i, approutes[i]);
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
    routerMiddleware(ctx, next) {
        var _this = this;

        return _asyncToGenerator(function* () {
            // 中间件
            let url = ctx.request.path;
            yield _this.routingMethodExecution(url, ctx);
            return next();
        })();
    }

    /**
     * @private
     * route中间件处理主方法
     */
    routingMethodExecution(url, ctx) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let goNotfound = (() => {
                var _ref4 = _asyncToGenerator(function* () {
                    let Cb = require(bun.APP_PATH + '/404.js');
                    let oCb = new Cb();
                    yield oCb.execute.call(oCb, ctx);
                });

                return function goNotfound() {
                    return _ref4.apply(this, arguments);
                };
            })();

            if (ctx.method === 'GET') {
                if (!_this2.routes.get[url]) {
                    let apppathar = url.split('/');
                    // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/*，再匹配/*
                    for (let i = apppathar.length; i > 1; i--) {
                        let apppath = apppathar.slice(0, i).join('/') + '/*';
                        if (_this2.routes.get[apppath] && typeof _this2.routes.get[apppath] === 'function') {
                            yield _this2.routes.get[apppath](ctx);
                            return;
                        }
                    }
                    yield goNotfound();
                    return;
                } else if (typeof _this2.routes.get[url] !== 'function') {
                    yield goNotfound();
                    return;
                }
                yield _this2.routes.get[url](ctx);
            } else if (ctx.method === 'POST') {
                if (!_this2.routes.post[url] || typeof _this2.routes.post[url] !== 'function') {
                    yield goNotfound();
                    return;
                }
                yield _this2.routes.post[url](ctx);
            } else {
                ctx.throw(404, 'connot found');
            }
        })();
    }
}
module.exports = Routes;