'use strict';

require("core-js/modules/es.promise");

require("core-js/modules/es.string.split");

const resolve = require('path').resolve; // const nunjucks = require('nunjucks');


const pug = require('pug');

const fs = require('fs');
/**
 * See: http://mozilla.github.io/nunjucks/api.html#configure
 * @param  {[type]} path nunjucks configure path
 * @param  {[type]} opts nunjucks configure opts
 * @return {[type]}      [description]
 */


module.exports = (path, opts) => {
  path = resolve(path || 'views');
  opts = opts || {};
  const ext = '.' + (opts.ext || 'html');
  return function view(ctx, next) {
    if (ctx.render) return next();
    const render = pug.renderFile; // 渲染模板出html

    ctx.renderHtml = (view, locals) => {
      let appname = view.split('/')[0];
      let manifest = fs.readFileSync(bun.ROOT_PATH + '/static/' + appname + '/manifest.json');
      let state = Object.assign({}, ctx.state, locals, {
        staticSources: JSON.parse(manifest.toString())
      });
      return new Promise((res, rej) => {
        render(path + '/' + view + ext, state, (err, html) => {
          if (err) return rej(err);
          res(html);
        });
      });
    }; // 渲染模板并渲染到页面


    ctx.render = (view, locals) => {
      let appname = view.split('/')[0];
      let manifest = fs.readFileSync(bun.ROOT_PATH + '/static/' + appname + '/manifest.json');
      let state = Object.assign({}, ctx.state, locals, {
        staticSources: JSON.parse(manifest.toString())
      });
      return new Promise((res, rej) => {
        render(path + '/' + view + ext, state, (err, html) => {
          if (err) return rej(err); // Render with response content-type, fallback to text/html

          ctx.type = 'text/html';
          ctx.body = html;
          res();
        });
      });
    };

    return next();
  };
};