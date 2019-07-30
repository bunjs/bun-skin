'use strict';

/**
 * 捕获全局错误
 * @param  {[ctx]} 请求上下文
 * @param  {[next]} 下一个中间件generator对象
 * @return {} 
 */
export = async (ctx: any, next: any) => {
    try {
        await next();
    }
    catch (e) {
        if (e instanceof Exception) {
            ctx.body = JSON.stringify({
                code: e.code,
                msg: e.msg
            });
        }
        else if (e instanceof Error) {
            ctx.status = 500;
            ctx.body = '500 服务器错误';
            bun.Logger.error(e);
        }
    }
    return;
};