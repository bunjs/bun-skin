'use strict';
/**
 * 捕获全局错误
 * @param  {[ctx]} 请求上下文
 * @param  {[next]} 下一个中间件generator对象
 * @return {} 
 */

require("core-js/modules/es.promise");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

module.exports =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (ctx, next) {
    try {
      yield next();
    } catch (e) {
      ctx.status = 500;
      ctx.body = '服务器错误';
      bun.Logger.error(e);
    }

    return;
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();