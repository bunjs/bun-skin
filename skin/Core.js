const Koa = require('koa');
const views = require('./middleware/bun_view.js');
const catchError = require('./middleware/bun_catch_error.js');
const router = require('./middleware/bun_router.js');
const serverStaic = require('koa-static');
const bodyParser = require('koa-bodyparser');
const { globalPath, viewExt, defaultPort } = require('./config');
const initApp = require('./InitApp.js');
const Logger = require('./Logger.js');
const Loader = require('./Loader.js');
const Routes = require('./Routes.js');
const path = require('path');
const fs = require('fs');
const Plugin = require('./Plugin.js');
const emitter = require('./event.js');
const utils = require('./utils');
const Exception = require('./Exception.js');

class Bun extends Koa {
	/**
	 * 接受参数
	 * @params name bun
	 * @params ROOT_PATH app根目录执行路径
	 * @params port 启动端口号 默认4000
	 */
	constructor(name, options) {
		super();
		this.name = name;
		// 保证 context.app 是 bun 而不是 koa
		this.context.app = this;
		// 获取根目录
		const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
		// 设置全局路径
		Object.assign(this, globalPath(rootPath));
		// 初始化日志
		this.Logger = Logger(this.LOG_PATH);
		// 初始化加载器
		this.Loader = Loader;
		// 初始化路由
		this.Routes = Routes;
		this.events = emitter;
		this.plugins = {};
		this.lib = {};
		this.app = {};
		//解决后端渲染前端资源时遇到css相关文件报错的问题
		const Module = require('module');
		Module._extensions['.less'] = function(module, fn) {
			return '';
		};
		Module._extensions['.css'] = function(module, fn) {
			return '';
		};
		// 冻结第一层bun对象，只读，防止用户错误覆盖
		Object.freeze(bun);
	}

	/**
	 * 设置Exception异常类
	 */
	setException() {
		global.Exception = Exception;
		this.emitter('setException');
	}

	/**
	 * 冻结指定目录
	 * 并发布事件，防止生命周期里用户覆盖bun对象
	 */
	emitter(eventName, freeze) {
		if (freeze) {
			utils.deepFreeze(freeze);
		}
		emitter.emit(eventName, this);
	}

	/**
	 * 初始化目录下所有app
	 * app包含属性：routes, class
	 */
	initAllApps() {
		let routes = {};
		
		let files = fs.readdirSync(this.ROOT_PATH + '/app');
		files.forEach((filename) => {
			let stat = fs.lstatSync(this.ROOT_PATH + '/app' + '/' + filename);
			if (stat.isDirectory()) {
				// 为每个app按照目录做根路由
				// new一个新路由实例，以app名作为key存放在对象
				routes = new this.Routes(filename);
				// 将每个app相关属性存入全局备用
				this.app[filename] = initApp(filename);
			}
		});
		this.emitter('initApp', this.app);
	}

	/**
	 * 设置lib全局变量
	 * 将lib里的公共类设置到全局，方便引用
	 */
	setLib() {
		this.Loader({ keypath: 'lib', path: '/lib', context: this.lib });
		this.emitter('setLib', this.lib);
	}

	/**
	 * 设置插件
	 * 初始化所有插件，并注册到bun
	 */
	setPlugins() {
		Plugin();
		this.emitter('setPlugins', this.plugins);
	}

	/**
	 * 设置app路由中间件（appname做根路由）
	 * 将router中间件注册进koa
	 */
	setRouter() {
		let routes = new this.Routes();
        for (let i in this.app) {
            routes.mergeAppRoutes(this.app[i].router.routesHandle);
        }
        this.use(router(routes.routesHandle));
		this.emitter('setRouter');
	}

	/**
	 * 设置请求日志中间件
	 */
	setReqLog() {
		// 捕捉全部请求到日志
		this.use(this.Logger.log4js.koaLogger(this.Logger.reqLog(), {
			format: '[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]',
			level: 'auto'
		}));
		this.emitter('setReqLog');
	}

	/**
	 * 设置静态服务中间件
	 */
	setServerStaic() {
		this.use(serverStaic(this.STATIC_PATH));
		this.emitter('setServerStaic');
	}

	/**
	 * 设置请求解析中间件
	 */
	setBodyParser() {
		this.use(bodyParser());
		this.emitter('setBodyParser');
	}

	/**
	 * 设置渲染视图中间件
	 */
	setViews() {
		this.use(views(this.TPL_PATH, {
			ext: viewExt
		}));
		this.emitter('setViews');
	}

	/**
	 * 捕获所有业务错误
	 * 错误会统一打到日志app-worker.log.wf
	 */
	setErrHandle() {
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
	run(port = defaultPort) {
		this.listen(port);
		// 冻结bun对象，只读，防止用户错误覆盖
		utils.deepFreeze(bun, 'context');
		console.log('start on' + port);
	}
}

module.exports = Bun;