"use strict";

require("core-js/modules/es.array.slice");

require("core-js/modules/es.promise");

require("core-js/modules/es.string.split");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

module.exports = routes => {
  function goNotfound(_x) {
    return _goNotfound.apply(this, arguments);
  }

  function _goNotfound() {
    _goNotfound = _asyncToGenerator(function* (ctx) {
      let Cb = require(bun.APP_PATH + '/404.js');

      let oCb = new Cb();
      oCb.beforeExecute && (yield oCb.beforeExecute.call(oCb, ctx));
      yield oCb.execute.call(oCb, ctx);
      oCb.afterExecute && (yield oCb.afterExecute.call(oCb, ctx));
    });
    return _goNotfound.apply(this, arguments);
  }

  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(function* (ctx, next) {
        let url = ctx.request.path;

        if (ctx.method === 'GET') {
          if (!routes.get[url]) {
            let apppathar = url.split('/'); // 路由从后向前匹配/*，如url为/app/home,则先匹配/app/*，再匹配/*

            for (let i = apppathar.length; i > 1; i--) {
              let apppath = apppathar.slice(0, i).join('/') + '/*';

              if (routes.get[apppath] && typeof routes.get[apppath] === 'function') {
                yield routes.get[apppath](ctx);
                return;
              }
            }

            yield goNotfound(ctx);
            return;
          } else if (typeof routes.get[url] !== 'function') {
            yield goNotfound(ctx);
            return;
          }

          yield routes.get[url](ctx);
        } else if (ctx.method === 'POST') {
          if (!routes.post[url] || typeof routes.post[url] !== 'function') {
            yield goNotfound(ctx);
            return;
          }

          yield routes.post[url](ctx);
        } else {
          ctx.throw(404, 'connot found');
        }

        return next();
      });

      return function (_x2, _x3) {
        return _ref.apply(this, arguments);
      };
    }()
  );
};