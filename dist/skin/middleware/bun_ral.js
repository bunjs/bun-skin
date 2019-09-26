'use strict';
module.exports = async (ctx, next) => {
    const url = ctx.request.path;
    let appContext;
    if (bun.isSingle) {
        appContext = bun.class.prototype;
    }
    else {
        const apppathar = url.split('/');
        const appname = apppathar[1];
        if (!bun.class[appname]) {
            return next();
        }
        appContext = bun.class[appname].prototype;
    }
    const _ralcache = appContext.ral;
    appContext.ral = (serverName, options) => {
        const optionsL = options;
        optionsL.header = optionsL.header || {};
        optionsL.header.cookie = ctx.header.cookie;
        return _ralcache(serverName, options);
    };
    return next();
};
//# sourceMappingURL=bun_ral.js.map