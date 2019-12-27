import { IContext } from '../../types/Context';

export = (routes: IRoutesHandle): any => {
    async function goNotfound(ctx: IContext) {
        const Cb = require(ctx.bun.globalPath.APP_PATH + '/404.js');
        const oCb = new Cb();
        oCb.beforeExecute && (await oCb.beforeExecute.call(oCb, ctx));
        await oCb.execute.call(oCb, ctx);
        oCb.afterExecute && (await oCb.afterExecute.call(oCb, ctx));
    }
    return async (ctx: IContext, next: any) => {
        let url = ctx.request.path;
        if (url === '/favicon.ico') { return; }
        if (ctx.method === 'GET') {
            if (url === '') {
                url = '/';
            }
            const apppathar = url.split('/');
            if (apppathar.length > 2 && !apppathar[apppathar.length - 1]) {
                apppathar.pop();
            }
            // if (url !== '/' && apppathar.length === 2) {
            //     // 针对/app 这种情况做兼容，变成/app/
            //     url += '/';
            //     apppathar.push('/');
            // }
            if (!routes.get[url]) {
                // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/home/*, 然后/app/*，再匹配/*
                for (let i = apppathar.length; i > 0; i--) {
                    const apppath = apppathar.slice(0, i).join('/') + '/*';
                    if (routes.get[apppath] && typeof routes.get[apppath] === 'function') {
                        await routes.get[apppath](ctx);
                        return next();
                    }
                }
                await goNotfound(ctx);
            } else if (typeof routes.get[url] !== 'function') {
                await goNotfound(ctx);
            } else {
                await routes.get[url](ctx);
            }
        } else if (ctx.method === 'POST') {
            if (routes.post[url] && typeof routes.post[url] === 'function') {
                await routes.post[url](ctx);
            } else {
                await goNotfound(ctx);
            }
        } else {
            ctx.throw(404, 'connot found');
        }

        return next();
    };
};
