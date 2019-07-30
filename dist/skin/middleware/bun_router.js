"use strict";
module.exports = (routes) => {
    async function goNotfound(ctx) {
        const Cb = require(bun.globalPath.APP_PATH + '/404.js');
        const oCb = new Cb();
        oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
        await oCb.execute.call(oCb, ctx);
        oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
    }
    return async (ctx, next) => {
        const url = ctx.request.path;
        if (ctx.method === 'GET') {
            if (!routes.get[url]) {
                const apppathar = url.split('/');
                for (let i = apppathar.length; i > 1; i--) {
                    const apppath = apppathar.slice(0, i).join('/') + '/*';
                    if (routes.get[apppath] && typeof routes.get[apppath] === 'function') {
                        await routes.get[apppath](ctx);
                        return;
                    }
                }
                await goNotfound(ctx);
                return;
            }
            else if (typeof routes.get[url] !== 'function') {
                await goNotfound(ctx);
                return;
            }
            await routes.get[url](ctx);
        }
        else if (ctx.method === 'POST') {
            if (!routes.post[url] || typeof routes.post[url] !== 'function') {
                await goNotfound(ctx);
                return;
            }
            await routes.post[url](ctx);
        }
        else {
            ctx.throw(404, 'connot found');
        }
        return next();
    };
};
//# sourceMappingURL=bun_router.js.map