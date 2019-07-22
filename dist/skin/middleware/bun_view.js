'use strict';
const path_1 = require("path");
const pug = require("pug");
const fs = require("fs");
module.exports = (path, opts) => {
    path = path_1.resolve(path || 'views');
    opts = opts || {};
    const ext = '.' + (opts.ext || 'html');
    return function view(ctx, next) {
        if (ctx.render)
            return next();
        const render = pug.renderFile;
        ctx.renderHtml = (view, locals) => {
            let appname = view.split('/')[0];
            let manifest = fs.readFileSync(bun.globalPath.ROOT_PATH + '/static/' + appname + '/manifest.json');
            let state = Object.assign({}, ctx.state, locals, { staticSources: JSON.parse(manifest.toString()) });
            return new Promise((res, rej) => {
                render(path + '/' + view + ext, state, (err, html) => {
                    if (err)
                        return rej(err);
                    res(html);
                });
            });
        };
        ctx.render = (view, locals) => {
            let appname = view.split('/')[0];
            let manifest = fs.readFileSync(bun.globalPath.ROOT_PATH + '/static/' + appname + '/manifest.json');
            let state = Object.assign({}, ctx.state, locals, { staticSources: JSON.parse(manifest.toString()) });
            return new Promise((res, rej) => {
                render(path + '/' + view + ext, state, (err, html) => {
                    if (err)
                        return rej(err);
                    ctx.type = 'text/html';
                    ctx.body = html;
                    res();
                });
            });
        };
        return next();
    };
};
//# sourceMappingURL=bun_view.js.map