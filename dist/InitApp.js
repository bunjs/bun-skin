"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.last-index-of");

require("core-js/modules/es.string.match");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const fs = require('fs');

const _require = require('./config'),
      loaderList = _require.loaderList,
      err = _require.err;

const _require2 = require('./utils'),
      curry = _require2.curry,
      run = _require2.run; // import injectTapEventPlugin from 'react-tap-event-plugin';


module.exports = appName => {
  /**
   * 初始化每个app的公共class（每个class的原型上注册对应的model方法）
   *
   * @private
   * @params appName app名称
   * @params route 路由
   */
  const initAppClass = curry(appName => {
    // 默认App继承Common_Action
    let classExtends = bun.lib.Common_Action;
    let routes = new bun.Routes(appName);

    class App extends classExtends {
      constructor() {
        super(); // 单个app对应的route示例作为公共类的属性方便Controller类调用

        this.Routes = routes;
        this.appName = appName;
      }

    }

    return {
      name: appName,
      class: App,
      router: routes
    };
  });
  /**
   * 为APP类添加conf方法
   * 
   * app
   */

  const registerConfFun = curry(app => {
    let appName = app.name;
    let context = app.class.prototype;

    const _getConfPath = curry((appName, appendApp, filename) => {
      let path = bun.CONF_PATH + '/' + appName + (appendApp ? '/app/' : '/') + filename;
      let pos = filename.lastIndexOf('.');

      if (pos === -1) {
        path = path + '.js';
      } else {
        let filePostfix = filename.substr(pos + 1);

        if (filePostfix !== 'js') {
          throw new Exception(_objectSpread({}, err.ERROR_APP_CONNOT_LOAD_NOJS_FILE, {
            msg: 'connot load .' + filePostfix + ' please instead of .js'
          }));
        }
      }

      return path;
    });

    const _getConf = curry(path => {
      let resJson = require(path);

      return resJson;
    });

    context.getAppConf = run(_getConf, _getConfPath(appName, true));
    context.getConf = run(_getConf, _getConfPath(appName, false));
    return app;
  });
  /**
   * 将action层和model层下的类使用loader直接作为公共类属性
   * 匹配规则为路径匹配，例如：
   * action：Action_Show_Home
   * model：Services_Data_ApiData
   * 
   */

  const registerAppAttributes = curry((loaderList, app) => {
    for (let i = 0; i < loaderList.length; i++) {
      bun.Loader({
        keypath: loaderList[i]['match'],
        path: loaderList[i]['path'],
        name: loaderList[i]['name'] || '*',
        context: app.class.prototype,
        type: 'async',
        isNecessary: loaderList[i]['isNecessary']
      });
    }

    return app;
  });
  /**
   * 执行每个app的controller
   *
   * @private
   * @params appName app名称
   */

  const runAppController = app => {
    let Controller_Main = require(bun.APP_PATH + '/' + app.name + '/controller/Main.js');

    let main = new Controller_Main();
    main.execute();
    return app;
  }; // app公共类附在全局bun上，方便继承
  // 加一层class命名空间是担心用户app命名与bun自由属性冲突


  const registerGlobalClass = curry(app => {
    if (!bun.class) {
      bun.class = {
        [app.name]: app.class
      };
    } else {
      bun.class[app.name] = app.class;
    }

    return app;
  });
  const initApp = run(runAppController, registerGlobalClass, registerConfFun, registerAppAttributes(loaderList(appName)), initAppClass);
  return initApp(appName);
};