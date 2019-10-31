'use strict';

import fs = require('fs');
import { resolve } from 'path';
// const nunjucks = require('nunjucks');
import pug = require('pug');
import { IContext } from "../../types/interface";
/**
 * See: http://mozilla.github.io/nunjucks/api.html#configure
 * @param  {[type]} path nunjucks configure path
 * @param  {[type]} opts nunjucks configure opts
 * @return {[type]}      [description]
 */
export = (path: string, opts: any) => {
    path = resolve(path || 'views');
    opts = opts || {};
    const ext = '.' + (opts.ext || 'html');
    const render = pug.renderFile;
    return function view(ctx: IContext, next: any) {
        if (ctx.render) { return next(); }
        
        // 渲染模板出html
        ctx.renderHtml = (_view: string, locals: any) => {
            let appPath: string;
            if (ctx.bun.isSingle) {
                appPath = '';
            } else {
                const appname = _view.split('/')[0];
                appPath = '/' + appname;
            }
            const manifest = fs.readFileSync(ctx.bun.globalPath.ROOT_PATH + '/static'+ appPath +'/manifest.json');
            const state = Object.assign({}, ctx.state, locals, {staticSources: JSON.parse(manifest.toString())});

            return new Promise((res, rej) => {
                render(path +'/'+ _view + ext, state, (err, html) => {
                    if (err) { return rej(err); }
                    res(html);
                });
            });
        };
        // 渲染模板并渲染到页面
        ctx.render = (_view: string, locals: any) => {
            let appPath: string;
            if (ctx.bun.isSingle) {
                appPath = '';
            } else {
                const appname = _view.split('/')[0];
                appPath = '/' + appname;
            }
            const manifest = fs.readFileSync(ctx.bun.globalPath.ROOT_PATH + '/static'+ appPath +'/manifest.json');
            const state = Object.assign({}, ctx.state, locals, {staticSources: JSON.parse(manifest.toString())});

            return new Promise((res, rej) => {
                render(path +'/'+_view + ext, state, (err, html) => {
                    if (err) { return rej(err); }
                    // Render with response content-type, fallback to text/html
                    ctx.type = 'text/html';
                    ctx.body = html;
                    res();
                });
            });
        };
        return next();
    };
};