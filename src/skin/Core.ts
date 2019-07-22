import fs = require("fs");
import Koa = require("koa");
import bodyParser = require("koa-bodyparser");
import serverStaic = require("koa-static");
import path = require("path");
import { defaultPort, globalPath, viewExt } from "./config";
import emitter = require("./event.js");
import Exception = require("./Exception.js");
import initApp = require("./InitApp.js");
import Loader = require("./Loader.js");
import Logger = require("./Logger.js");
import catchError = require("./middleware/bun_catch_error.js");
import router = require("./middleware/bun_router.js");
import views = require("./middleware/bun_view.js");
import Plugin = require("./Plugin.js");
import Routes = require("./Routes.js");
import { deepFreeze } from "./utils";

import { Apps } from "../interface";

class Bun extends Koa {
  public name: string;
  public Logger: any;
  public Routes: any;
  public use: any;
  public Loader: any;
  public events: any;
  public plugins: object;
  public lib: object;
  public app: Apps;
  public context: any;
  public globalPath: any;
  /**
	 * 接受参数
	 * @params name bun
	 * @params ROOT_PATH app根目录执行路径
	 * @params port 启动端口号 默认4000
	 */
  constructor(name: string, options: any) {
      super();
      this.name = name;
      // 保证 context.app 是 bun 而不是 koa
      this.context.app = this;
      // 获取根目录
      const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
      // 设置全局路径
      this.globalPath = {};
      Object.assign(this.globalPath, globalPath(rootPath));
      // 初始化日志
      this.Logger = Logger(this.globalPath.LOG_PATH);
      // 初始化加载器
      this.Loader = Loader;
      // 初始化路由
      this.Routes = Routes;
      this.events = emitter;
      this.plugins = {};
      this.lib = {};
      
      // 解决后端渲染前端资源时遇到css相关文件报错的问题
      const Module = require("module");
      Module._extensions[".less"] = (module: any, fn: any) => {
          return "";
      };
      Module._extensions[".css"] = (module: any, fn: any) => {
          return "";
      };
      // 冻结第一层bun对象，只读，防止用户错误覆盖
      Object.freeze(bun);
  }

  /**
	 * 设置Exception异常类
	 */
  public setException() {
      (global as any).Exception = Exception;
      this.emitter("setException");
  }

  /**
	 * 初始化目录下所有app
	 * app包含属性：routes, class
	 */
  public initAllApps() {
      let routes = {};
      this.app = {};
      const files = fs.readdirSync(this.globalPath.ROOT_PATH + "/app");
      files.forEach((filename) => {
          const stat = fs.lstatSync(this.globalPath.ROOT_PATH + "/app" + "/" + filename);
          if (stat.isDirectory()) {
              // 为每个app按照目录做根路由
              // new一个新路由实例，以app名作为key存放在对象
              routes = new this.Routes(filename);
              // 将每个app相关属性存入全局备用
              this.app[filename] = initApp(filename);
          }
      });
      this.emitter("initApp", this.app);
  }

  /**
	 * 设置lib全局变量
	 * 将lib里的公共类设置到全局，方便引用
	 */
  public setLib() {
      this.Loader({ keypath: "lib", path: "/lib", context: this.lib });
      this.emitter("setLib", this.lib);
  }

  /**
	 * 设置插件
	 * 初始化所有插件，并注册到bun
	 */
  public setPlugins() {
      Plugin();
      this.emitter("setPlugins", this.plugins);
  }

  /**
	 * 设置app路由中间件（appname做根路由）
	 * 将router中间件注册进koa
	 */
  public setRouter() {
      const routes = new this.Routes();
      for (const [key, value] of Object.entries(this.app)) {
          routes.mergeAppRoutes(value.router.routesHandle);
      }
      this.use(router(routes.routesHandle));
      this.emitter("setRouter");
  }

  /**
	 * 设置请求日志中间件
	 */
  public setReqLog() {
      // 捕捉全部请求到日志
      this.use(this.Logger.log4js.koaLogger(this.Logger.reqLog(), {
          format: "[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]",
          level: "auto",
      }));
      this.emitter("setReqLog");
  }

  /**
	 * 设置静态服务中间件
	 */
  public setServerStaic() {
      this.use(serverStaic(this.globalPath.STATIC_PATH));
      this.emitter("setServerStaic");
  }

  /**
	 * 设置请求解析中间件
	 */
  public setBodyParser() {
      this.use(bodyParser());
      this.emitter("setBodyParser");
  }

  /**
	 * 设置渲染视图中间件
	 */
  public setViews() {
      this.use(views(this.globalPath.TPL_PATH, {
          ext: viewExt,
      }));
      this.emitter("setViews");
  }

  /**
	 * 捕获所有业务错误
	 * 错误会统一打到日志app-worker.log.wf
	 */
  public setErrHandle() {
      this.use(catchError);
  }

  /**
	 * @desc 监听进程退出，打印日志，触发 exit 事件
	 */
  // initExitHook() {
  // 	this.exitHook = new ExitHook({
  // 		onExit: (err: Error) => {
  // 			if (err) {
  // 				this.prettyLog(err.stack || err.message, {
  // 					level: 'error'
  // 				});
  // 			}
  // 			this.prettyLog('process is exiting');
  // 			Events.emit('exit', err, this);
  // 		},
  // 		onExitDone: (code: number) => {
  // 			// this.prettyLog(`process exited: ${code}`);
  // 		}
  // 	});
  // }

  /**
	 * 启动服务
	 */
  public run(port: string | number = defaultPort) {
      this.listen(port);
      // 冻结bun对象，只读，防止用户错误覆盖
      deepFreeze(bun, "context");
      console.log("start on" + port);
  }

  /**
	 * 冻结指定目录
	 * 并发布事件，防止生命周期里用户覆盖bun对象
	 */
  private emitter(eventName: string, freeze?: any) {
      if (freeze) {
          deepFreeze(freeze);
      }
      emitter.emit(eventName, this);
  }
}

export = Bun;