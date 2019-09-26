'use strict';

/**
 * 捕获全局错误
 * @param  {[ctx]} 请求上下文
 * @param  {[next]} 下一个中间件generator对象
 * @return {} 
 */
export = async (ctx: any, next: any) => {
    const url = ctx.request.path;
    let appContext: any;
    if (bun.isSingle) {
        appContext = bun.class.prototype;
    } else {
        const apppathar = url.split('/');
        const appname = apppathar[1];
        if(!bun.class[appname]) {
            return next();
        }
        appContext = bun.class[appname].prototype;
    }
    const _ralcache = appContext.ral;
    appContext.ral = (serverName: string, options: any) => {
        const optionsL = options;
        optionsL.header = optionsL.header || {};
        optionsL.header.cookie = ctx.header.cookie;

        return _ralcache(serverName, options);
    };

    return next();
};