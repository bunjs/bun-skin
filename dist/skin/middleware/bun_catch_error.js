'use strict';
module.exports = async (ctx, next) => {
    try {
        await next();
    }
    catch (e) {
        if (e instanceof ctx.bun.Exception) {
            ctx.body = JSON.stringify({
                code: e.code,
                msg: e.msg
            });
        }
        else if (e instanceof Error) {
            ctx.status = 500;
            ctx.body = '500 服务器错误';
            ctx.bun.Logger.error(e);
        }
    }
};
//# sourceMappingURL=bun_catch_error.js.map