import Koa = require("koa");
import path = require("path");
import {
    IException
} from "../types/Exception";
import {
    IApp,
    IApps,
    IContext,
    IGlobalPath,
    ILoader,
    IParams,
} from "../types/interface";
import {
    IRoutes
} from "../types/Routes";
import {
    globalPath,
} from "./config";
import core = require("./Core");
import emitter = require("./event");
import exception = require("./Exception");
import Loader = require("./Loader");
import Logger = require("./Logger");
import routes = require("./Routes");
import {
    deepFreeze
} from "./utils";
import { run } from "./utils";

class Bun extends Koa {
    public name: string;
    public Logger: any;
    public Routes: typeof IRoutes;
    public use: any;
    public Loader: ILoader;
    public plugins: object;
    public lib: object;
    public app: IApps | IApp;
    public context: IContext;
    public globalPath: IGlobalPath;
    public globalModule: any;
    public isSingle: boolean;
    public port: number | string;
    public Exception: typeof IException;
    /**
	 * 接受参数
	 * @params name bun
	 * @params ROOT_PATH app根目录执行路径
	 * @params port 启动端口号 默认4000
	 */
    constructor(name: string, options: IParams) {
        super();
        this.name = name;
        this.isSingle = !!options.isSingle;
        // 保证 context.app 是 bun 而不是 koa
        this.context.app = this;
        this.port = options.port || 8000;
        // 获取根目录
        const rootPath = options.ROOT_PATH || path.dirname(require.main.filename);
        // 设置全局路径
        this.globalPath = Object.assign({}, globalPath(rootPath));
        // 初始化日志
        this.Logger = Logger(this.globalPath.LOG_PATH);
        // 初始化加载器
        this.Loader = Loader(this.isSingle, this.Logger, this.globalPath);
        // 初始化路由
        this.Routes = routes(this.isSingle, this.globalPath);
        this.Exception = exception(this);
        this.plugins = {};
        this.app = {};
        this.lib = {};
        this.globalModule = {};
        // 解决后端渲染前端资源时遇到css相关文件报错的问题
        const Module = require("module");
        Module._extensions[".less"] = (module: any, fn: any) => {
            return "";
        };
        Module._extensions[".css"] = (module: any, fn: any) => {
            return "";
        };
        // 冻结第一层bun对象，只读，防止用户错误覆盖
        // Object.freeze(this);
    }

    /**
	 * 冻结指定目录
	 * 并发布事件，防止生命周期里用户覆盖bun对象
	 */
    public emitter(eventName: string, freeze? : any) {
        if (freeze) {
            deepFreeze(freeze);
        }
        emitter.emit(eventName, this);
    }

    /**
     * 冻结指定目录
     * 并发布事件，防止生命周期里用户覆盖bun对象
     */
    public bootstrap() {
        try {
            run(
                core.start(this.port),
                core.setPlugins,
                core.setRouter,
                core.initAllApps,
                core.setGlobalModule,
                core.setLib,
                core.setViews,
                core.setBodyParser,
                core.setServerStaic,
                core.setRal,
                core.setReqLog,
                core.setErrHandle,
                core.setContext
            )(this);
        } catch (e) {
            this.Logger.bunerr(e);
        }
    }
}
export = Bun;