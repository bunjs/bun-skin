import fs = require("fs");
import Koa = require("koa");
import bodyParser = require("koa-bodyparser");
import serverStaic = require("koa-static");
import path = require("path");
import {
    IBun
} from "../types/Bun";
import {
    defaultPort,
    viewExt
} from "./config";
import { err, mvcLoaderList } from "./config";
import emitter = require("./event");
import initApp = require("./InitApp");
import catchError = require("./middleware/bun_catch_error");
import ral = require("./middleware/bun_ral");
import routerMiddleware = require("./middleware/bun_router");
import views = require("./middleware/bun_view");
import Plugin = require("./Plugin");
import {
    deepFreeze
} from "./utils";
import { curry } from "./utils";

export = {
    /**
	 * 设置Context
	 */
    setContext: curry((bun: IBun) => {
        bun.use((ctx: any, next: any) => {
            ctx.bun = {
                Loader: bun.Loader,
                Logger: bun.Logger,
                globalPath: bun.globalPath,
                isSingle: bun.isSingle,
                app: bun.app,
                Exception: bun.Exception
            };
            return next();
        });
        bun.emitter("setContext");
        return bun;
    }),

    /**
	 * 设置全局加载类
	 */
    setGlobalModule: curry((bun: IBun) => {
        if(bun.isSingle) {
            let loaderList = [ ...mvcLoaderList ];
            try {
                const appLoaderConf = require(bun.globalPath.CONF_PATH + '/globalLoader');
                loaderList = [ ...mvcLoaderList, ...appLoaderConf ];
            } catch (e) {
                bun.Logger.bunwarn("App globalLoader not found ");
            }
            bun.globalModule = bun.Loader.getGlobalModule(loaderList, '');
        } else {
            const files = fs.readdirSync(bun.globalPath.ROOT_PATH + "/app");
            files.forEach((filename) => {
                const stat = fs.lstatSync(bun.globalPath.ROOT_PATH + "/app" + "/" + filename);
                if (stat.isDirectory()) {
                    let loaderList = [ ...mvcLoaderList ];
                    try {
                        const appLoaderConf = require(bun.globalPath.CONF_PATH + '/' + filename + '/globalLoader');
                        loaderList = [ ...mvcLoaderList, ...appLoaderConf ];
                    } catch (e) {
                        bun.Logger.bunwarn('App ' + filename + " globalLoader not found ");
                    }
                    
                    bun.globalModule[filename] = bun.Loader.getGlobalModule(loaderList, filename);
                }
            });
        }

	    /* tslint:disable */
	    const Module = require("module");
	    function stripBOM(content: string) {
	        if (content.charCodeAt(0) === 0xFEFF) {
	            content = content.slice(1);
	        }
	        return content;
	    }
	    Module._extensions['.js'] = function (module: any, filename: string) {
	        let content = fs.readFileSync(filename, 'utf8');
	        let regExp = new RegExp(bun.globalPath.ROOT_PATH + (bun.isSingle ? '/app/.*' : '/app/(.*?)/.*'));
	        if (filename.indexOf('/node_modules') === -1
	            && filename.match(regExp)) {
	        	let appName = bun.isSingle ? '' : RegExp.$1;
	        	let globalModule = bun.isSingle ? bun.globalModule : bun.globalModule[RegExp.$1];
	            if (!globalModule) {
	            	module._compile(stripBOM(content), filename);
	            	return;
	            }
	            let currentKey = bun.Loader.getFuncName(filename.replace('.js', ''), bun.isSingle ? '/app' : '/app/' + appName);
	            let str = '';
	            Object.entries(globalModule).forEach(([key, value]) => {
	            	// 过滤自身名字、已require引入的名字 以及 未引用的名字
	            	if (key === currentKey || content.indexOf(key) === -1 || /a[\s]*=[\s]*require\(/i.test(content)) {
	            		return;
	            	}
	                str += 'const ' + key + ' = require("'+ value + '");\n';
	            });
	            if(content.indexOf('extends BUN_App')) {
	            	 str += 'const BUN_App = bun.app'+ (appName ? '.' + appName : '') + '.class;\n';
	            }
	            content = str + '\n' + content;
	        }
	        module._compile(stripBOM(content), filename);
	    };
	    /* tslint:enable */
        bun.emitter("setGlobalModule");
        return bun;
    }),

    /**
	 * 初始化目录下所有app
	 * app包含属性：routes, class
	 */
    initAllApps: curry((bun: IBun) => {
        // let routes = {};
        if(bun.isSingle) {
            // (bun.app as IApp) = initApp(bun, '');
            initApp(bun, '');
        } else {
            const files = fs.readdirSync(bun.globalPath.ROOT_PATH + "/app");
            files.forEach((filename: string) => {
                const stat = fs.lstatSync(bun.globalPath.ROOT_PATH + "/app" + "/" + filename);
                if (stat.isDirectory()) {
                    // 为每个app按照目录做根路由
                    // new一个新路由实例，以app名作为key存放在对象
                    // routes = new bun.Routes(filename);
                    // 将每个app相关属性存入全局备用
                    // (bun.app as IApps)[filename] = initApp(bun, filename);
                    initApp(bun, filename);
                }
            });
        }
        
        bun.emitter("initApp", bun.app);
        return bun;
    }),

    /**
	 * 设置lib全局变量
	 * 将lib里的公共类设置到全局，方便引用
	 */
    setLib: curry((bun: IBun) => {
        bun.Loader.loader({
            keypath: "lib",
            path: "/lib",
            context: bun.lib
        });
        bun.emitter("setLib", bun.lib);
        return bun;
    }),

    /**
	 * 设置插件
	 * 初始化所有插件，并注册到bun
	 */
    setPlugins: curry((bun: IBun) => {
        Plugin(bun);
        bun.emitter("setPlugins", bun.plugins);
        return bun;
    }),

    /**
	 * 设置app路由中间件（appname做根路由）
	 * 将router中间件注册进koa
	 */
    setRouter: curry((bun: IBun) => {
        const routes = new bun.Routes();
        if(bun.isSingle) {
            routes.mergeAppRoutes((bun.app as IApp).router.routesHandle);
        } else {
            Object.entries(bun.app).forEach(([key, value]) => {
                routes.mergeAppRoutes(value.router.routesHandle);
            });
        }
        
        bun.use(routerMiddleware(routes.routesHandle));
        bun.emitter("setRouter");
        return bun;
    }),

    /**
	 * 设置请求日志中间件
	 */
    setReqLog: curry((bun: IBun) => {
        // 捕捉全部请求到日志
        bun.use(bun.Logger.log4js.koaLogger(bun.Logger.reqLog(), {
            format: "[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]",
            level: "auto",
        }));
        bun.emitter("setReqLog");
        return bun;
    }),

    /**
	 * 设置静态服务中间件
	 */
    setServerStaic: curry((bun: IBun) => {
        bun.use(serverStaic(bun.globalPath.STATIC_PATH));
        bun.emitter("setServerStaic");
        return bun;
    }),

    /**
	 * 设置请求解析中间件
	 */
    setBodyParser: curry((bun: IBun) => {
        bun.use(bodyParser());
        bun.emitter("setBodyParser");
        return bun;
    }),

    /**
	 * 设置渲染视图中间件
	 */
    setViews: curry((bun: IBun) => {
        bun.use(views(bun.globalPath.TPL_PATH, {
            ext: viewExt,
        }));
        bun.emitter("setViews");
        return bun;
    }),

    /**
	 * 捕获所有业务错误
	 * 错误会统一打到日志app-worker.log.wf
	 */
    setErrHandle: curry((bun: IBun) => {
        bun.use(catchError);
        return bun;
    }),

    /**
	 * 设置ral中间件
	 * 统一自动透传cookie
	 */
    setRal: curry((bun: IBun) => {
        bun.use(ral);
        bun.emitter("setRal");
        return bun;
    }),

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
    start: curry((port: string | number, bun: IBun) => {
        bun.listen(port);
        // 冻结bun对象，只读，防止用户错误覆盖
        deepFreeze(bun, "context");
        console.log("start on" + port);
        return bun;
    })
};