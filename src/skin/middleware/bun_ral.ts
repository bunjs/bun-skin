'use strict';

/**
 * 捕获全局错误
 * @param  {[ctx]} 请求上下文
 * @param  {[next]} 下一个中间件generator对象
 * @return {}
 */
import { IContext } from '../../types/Context';

export = async (ctx: IContext, next: any) => {
    const url = ctx.request.path;
    let appContext: any;
    if (ctx.bun.isSingle) {
        appContext = (ctx.bun.app as IApp).class.prototype;
    } else {
        const apppathar = url.split('/');
        const appname: string = apppathar[1];
        if (!(ctx.bun.app as IApps)[appname].class) {
            return next();
        }
        const apps = ctx.bun.app as IApps;
        appContext = apps[appname].class.prototype;
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
