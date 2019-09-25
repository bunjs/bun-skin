'use strict';
module.exports = async (ctx, next) => {
    const url = ctx.request.path;
    const apppathar = url.split('/');
    const appname = apppathar[1];
    const _ralcache = bun.class[appname].prototype.ral;
    bun.class[appname].prototype.ral = (serverName, options) => {
        let optionsL = options;
        optionsL.header = optionsL.header || {};
        optionsL.header.cookie = ctx.header.cookie;
        return _ralcache(serverName, options);
    };
    return next();
};
//# sourceMappingURL=bun_ral.js.map