"use strict";

const Koa = require('koa');

const views = require('./middleware/Render.js');

const catchError = require('./middleware/CatchError.js');

const serverStaic = require('koa-static');

const bodyParser = require('koa-bodyparser');

const dafaultConf = require('./config');

const Bun_Init = require('./Init.js');

const Logger = require('./Logger.js');

const Loader = require('./Loader.js');

const Routes = require('./Routes.js');

const path = require('path');

class Bun extends Koa {
  /**
      * 接受参数
      * @params name bun
      * @params ROOT_PATH app根目录执行路径
      * @params port 启动端口号 默认4000
      */
  constructor(name, options) {
    super();
    this.name = name; // 保证 context.app 是 daruk 而不是 koa

    this.context.app = this; // 获取根目录

    const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
    const globalPath = dafaultConf.globalPath(rootPath); // 设置全局路径

    Object.assign(this, globalPath); // 初始化日志

    this.Logger = Logger(this.LOG_PATH); // 初始化加载器

    this.Loader = Loader; // 初始化路由

    this.Routes = Routes; // 解决后端渲染window找不到的问题

    global.window = global.window || {
      config: {}
    }; //解决后端渲染前端资源时遇到css相关文件报错的问题

    const Module = require('module');

    Module._extensions['.less'] = function (module, fn) {
      return '';
    };

    Module._extensions['.css'] = function (module, fn) {
      return '';
    };
  }

  initApp() {
    new Bun_Init().init();
  }

  setMiddleware() {
    // 捕捉全部请求到日志
    this.use(this.Logger.log4js.koaLogger(this.Logger.reqLog(), {
      format: '[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]',
      level: 'auto'
    }));
    this.use(serverStaic(this.STATIC_PATH));
    this.use(bodyParser());
    this.use(views(this.TPL_PATH, {
      ext: dafaultConf.viewExt
    }));
  }

  catchErr() {
    this.use(catchError);
  }

  run(port = dafaultConf.port) {
    this.listen(port);
    console.log('start on' + port);
  }

}

module.exports = Bun;