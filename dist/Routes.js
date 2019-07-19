"use strict";

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.object.entries");

require("core-js/modules/es.promise");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

class Routes {
  constructor(appName) {
    this.appName = appName || '';
    this.routesHandle = {
      get: {},
      post: {}
    };
  }

  get(obj) {
    for (var _i = 0, _Object$entries = Object.entries(obj); _i < _Object$entries.length; _i++) {
      let _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      // 直接添加route时 this.routes.get[this.appName][key] = this.initCallback(obj[key])
      this.routesHandle.get['/' + this.appName + key] = this.initCallback(value);
    }
  }

  post(obj) {
    for (var _i2 = 0, _Object$entries2 = Object.entries(obj); _i2 < _Object$entries2.length; _i2++) {
      let _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
          key = _Object$entries2$_i[0],
          value = _Object$entries2$_i[1];

      this.routesHandle.post['/' + this.appName + key] = this.initCallback(value);
    }
  }
  /**
   * 实例化每个请求回调
   * 
   * @private
   * @params path 路由路径
   */


  initCallback(path) {
    let self = this;
    return (
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(function* (ctx) {
          let Cb = require(bun.APP_PATH + '/' + self.appName + path); // 改变render指向，定向为当前应用目录


          let render = ctx.render;

          ctx.render =
          /*#__PURE__*/
          function () {
            var _ref2 = _asyncToGenerator(function* (path, params) {
              yield render(self.appName + '/' + path, params);
            });

            return function (_x2, _x3) {
              return _ref2.apply(this, arguments);
            };
          }(); // 改变renderHtml指向，定向为当前应用目录


          let renderHtml = ctx.renderHtml;

          ctx.renderHtml =
          /*#__PURE__*/
          function () {
            var _ref3 = _asyncToGenerator(function* (path, params) {
              return yield renderHtml(self.appName + '/' + path, params);
            });

            return function (_x4, _x5) {
              return _ref3.apply(this, arguments);
            };
          }(); // 每次请求都新建一个实例，保证不会互相污染


          let oCb = new Cb();
          oCb.beforeExecute && (yield oCb.beforeExecute.call(oCb, ctx));
          yield oCb.execute.call(oCb, ctx);
          oCb.afterExecute && (yield oCb.afterExecute.call(oCb, ctx));
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()
    );
  }
  /**
   * merge routesHandle
   * 
   * @pubilc
   * @params appRoutesHandle 要merge的路由处理对象
   */


  mergeAppRoutes(appRoutesHandle) {
    // 扩展routes
    let self = this;

    for (var _i3 = 0, _Object$entries3 = Object.entries(this.routesHandle); _i3 < _Object$entries3.length; _i3++) {
      let _Object$entries3$_i = _slicedToArray(_Object$entries3[_i3], 2),
          method = _Object$entries3$_i[0],
          value = _Object$entries3$_i[1];

      this.routesHandle[method] = Object.assign({}, value, appRoutesHandle[method]);
    }
  }

}

module.exports = Routes;