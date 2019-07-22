
export = (routes: any) => {
    async function goNotfound(ctx: any) {
        let Cb = require(bun.globalPath.APP_PATH + '/404.js');
        let oCb = new Cb();
        oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
        await oCb.execute.call(oCb, ctx);
        oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
    }
    return async (ctx: any, next: any): Promise<any> => {
        let url = ctx.request.path;
        if (ctx.method === 'GET') {
            if (!routes.get[url]) {
                let apppathar = url.split('/');
                // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/*，再匹配/*
                for (let i = apppathar.length; i > 1; i--) {
                    let apppath = apppathar.slice(0, i).join('/') + '/*';
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
        } else if (ctx.method === 'POST') {
            if (!routes.post[url] || typeof routes.post[url] !== 'function') {
                await goNotfound(ctx);
                return;
            }
            await routes.post[url](ctx);
        } else {
            ctx.throw(404, 'connot found');
        }
        
        return next();
    };
}