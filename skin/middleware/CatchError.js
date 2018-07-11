'use strict';

/**
 * 捕获全局错误
 * @param  {[ctx]} 请求上下文
 * @param  {[next]} 下一个中间件generator对象
 * @return {} 
 */
module.exports = async (ctx, next) => {
    try {
        await next();
    }
    catch (e) {
        ctx.status = 500;
        bun.Logger.error(e);
    }
    return;
};