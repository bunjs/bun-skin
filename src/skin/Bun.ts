import Koa = require("koa");
import path = require("path");
import {
    App,
    Apps
} from "../interface";
import {
    globalPath,
} from "./config";
import emitter = require("./event.js");
import { loader } from "./Loader.js";
import Logger = require("./Logger.js");
import Routes = require("./Routes.js");
import {
    deepFreeze
} from "./utils";

class Bun extends Koa {
    public name: string;
    public Logger: any;
    public Routes: any;
    public use: any;
    public Loader: any;
    public events: any;
    public plugins: object;
    public lib: object;
    public app: Apps | App;
    public context: any;
    public globalPath: any;
    public globalModule: any;
    public isSingle: boolean;
    /**
	 * 接受参数
	 * @params name bun
	 * @params ROOT_PATH app根目录执行路径
	 * @params port 启动端口号 默认4000
	 */
    constructor(name: string, options: any) {
        super();
        this.name = name;
        this.isSingle = !!options.isSingle;
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
        this.Loader = loader;
        // 初始化路由
        this.Routes = Routes;
        this.events = emitter;
        this.plugins = {};
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
        Object.freeze(bun);
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
}
export = Bun;