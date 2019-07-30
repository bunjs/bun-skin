import fs = require("fs");
import { err, loaderList } from "./config";
import { curry, run } from "./utils";
// import injectTapEventPlugin from 'react-tap-event-plugin';

export = (appName: string) => {

    /**
     * 初始化每个app的公共class（每个class的原型上注册对应的model方法）
     *
     * @private
     * @params appName app名称
     * @params route 路由
     */
    const initAppClass = curry((name: string) => {
        // 默认App继承Common_Action
        const classExtends = bun.lib.Common_Action;
        const routes = new bun.Routes(name);
        abstract class App extends classExtends {
            public Routes: any;
            public appName: string;
            constructor() {
                super();
                // 单个app对应的route示例作为公共类的属性方便Controller类调用
                this.Routes = routes;
                this.appName = name;
            }
            public abstract execute(): any;
        }
        return {
            name,
            class: App,
            router: routes,
        };
    });

    /**
     * 为APP类添加conf方法
     *
     * app
     */
    const registerConfFun = curry((app: any) => {
        const context = app.class.prototype;
        const getConfPath = curry((name: string, appendApp: boolean, filename: string) => {
            let path = bun.globalPath.CONF_PATH + "/" + name +
                (appendApp ? "/app/" : "/") + filename;
            const pos = filename.lastIndexOf(".");
            if (pos === -1) {
                path = path + ".js";
            } else {
                const filePostfix = filename.substr(pos + 1);
                if (filePostfix !== "js") {
                    throw new Exception({
                        ...err.ERROR_APP_CONNOT_LOAD_NOJS_FILE,
                        ...{ msg: "connot load ." + filePostfix + " please instead of .js"},
                    });
                }
            }
            return path;
        });
        const getConf = curry((path: string) => {
            const resJson = require(path);
            return resJson;
        });
        context.getAppConf = run(getConf, getConfPath(app.name, true));
        context.getConf = run(getConf, getConfPath(app.name, false));
        return app;
    });

    /**
     * 将action层和model层下的类使用loader直接作为公共类属性
     * 匹配规则为路径匹配，例如：
     * action：Action_Show_Home
     * model：Services_Data_ApiData
     *
     */
    const registerAppAttributes = curry((loaderListConf: any, app: any) => {
        for (const loaderConf of loaderListConf) {
            bun.Loader({
                keypath: loaderConf.match,
                path: loaderConf.path,
                name: loaderConf.name || "*",
                context: app.class.prototype,
                type: "async",
                isNecessary: loaderConf.isNecessary,
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
    const runAppController = curry((app: any) => {
        const Controller_Main = require(bun.globalPath.APP_PATH + "/" + app.name + "/controller/Main.js");
        const main = new Controller_Main();
        main.execute();
        return app;
    });

    // app公共类附在全局bun上，方便继承
    // 加一层class命名空间是担心用户app命名与bun自由属性冲突
    const registerGlobalClass = curry((app: any) => {

        if (!bun.class) {
            bun.class = {
                [app.name]: app.class,
            };
        } else {
            bun.class[app.name] = app.class;
        }
        return app;
    });

    const initApp = run(
        runAppController,
        registerGlobalClass,
        registerConfFun,
        registerAppAttributes(loaderList(appName)),
        initAppClass,
    );

    return initApp(appName);
};