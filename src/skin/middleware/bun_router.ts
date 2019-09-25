
export = (routes: any) => {
    async function goNotfound(ctx: any) {
        const Cb = require(bun.globalPath.APP_PATH + '/404.js');
        const oCb = new Cb();
        oCb.beforeExecute && await oCb.beforeExecute.call(oCb, ctx);
        await oCb.execute.call(oCb, ctx);
        oCb.afterExecute && await oCb.afterExecute.call(oCb, ctx);
    }
    return async (ctx: any, next: any): Promise<any> => {
        let url = ctx.request.path;
        if (ctx.method === 'GET') {
            const apppathar = url.split('/');
            if(apppathar.length === 2) {
                // 针对/app 这种情况做兼容，变成/app/
                url += '/';
                apppathar.push('/');
            }
            if (!routes.get[url]) {
                // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/*，再匹配/*
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
};