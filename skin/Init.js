const fs = require('fs');
// import injectTapEventPlugin from 'react-tap-event-plugin';
/**
 * 框架初始化类
 *
 * @class
 */
class Nb_Init {

    /**
     * 初始化方法
     *
     * @public
     */
    init() {
        this.initLibPlugin();
        this.initApp();
    }

    /**
     * 初始化插件和公共库方法
     *
     * @private
     */
    initLibPlugin() {
        let loaderlist = {
            lib: '/lib'

        };
        for (let i in loaderlist) {
            if (loaderlist.hasOwnProperty(i)) {
                bun.Loader(i, loaderlist[i]);
            }
        }
        require('./Plugin.js')();
    }

    /**
     * 路由中间件绑定
     *
     * @private
     * @params approutes 注册好的路由对象
     */
    initRouter(approutes) {
        let router = new bun.Routes();
        for (let i in approutes) {
            router.mergeAppRoutes(i, approutes[i].routes);
        }
        bun.app.use(router.routerMiddleware.bind(router));
    }

    /**
     * 执行每个app的controller
     *
     * @private
     * @params appName app名称
     */
    initAppRouter(appName) {
        let Controller_Main = require(bun.APP_PATH + '/' + appName + '/controller/Main.js');
        let main = new Controller_Main();
        main.execute();
    }

    /**
     * 初始化app路由（appname做根路由）
     *
     * @private
     */
    initApp() {
        let files = fs.readdirSync(bun.ROOT_PATH + '/app');
        let routes = {};
        files.forEach((filename) => {
            let stat = fs.lstatSync(bun.ROOT_PATH + '/app' + '/' + filename);
            if (stat.isDirectory()) {
                // 为每个app按照目录做根路由
                // new一个新路由实例，以app名作为key存放在对象
                routes['/' + filename] = new bun.Routes(filename);
                this.initAppClass(filename, routes['/' + filename]);
                this.initAppRouter(filename);
            }
        });
        // 最后将所有app的路由并入一个路由实例中
        this.initRouter(routes)
    }

    /**
     * 初始化每个app的公共class（每个class的原型上注册对应的model方法）
     *
     * @private
     * @params appName app名称
     * @params route 路由
     */
    initAppClass(appName, route) {
        class App extends Common_Action {
            constructor() {
                super();
                // 单个app对应的route示例作为公共类的属性方便Controller类调用
                this.Routes = route;
                this.appName = appName;
                this.getAppConf = (filename) => {
                    let path = bun.CONF_PATH + '/' + appName + '/app/' + filename;
                    let pos = filename.lastIndexOf('.');
                    if (pos === -1) {
                        path = path + '.js';
                    } else {
                        let filePostfix = filename.substr(pos + 1);
                        if (filePostfix !== 'js') {
                            bun.Logger.bunError('connot load .' + filePostfix + ' please instead of .js');
                            // throw new Error('connot load .' + filePostfix + ' please instead of .js' );
                            return '';
                        }
                    }
                    
                    let resJson = require(path);
                    return resJson;
                }
                this.getConf = (filepath) => {
                    let path = bun.CONF_PATH + '/' + appName + '/' + filepath;
                    let pos = filepath.lastIndexOf('.');
                    if (pos === -1) {
                        path = path + '.js';
                    } else {
                        let filePostfix = filepath.substr(pos + 1);
                        if (filePostfix !== 'js') {
                            bun.Logger.bunError('connot load .' + filePostfix + ' please instead of .js');
                            // throw new Error('connot load .' + filePostfix + ' please instead of .js' );
                            return '';
                        }
                    }
                    let resJson = require(path);
                    return resJson;
                }
            }
        }
        // app公共类附在全局bun上，方便继承
        bun[appName] = App;

        /**
         * 将action层和model层下的类使用loader直接作为公共类属性
         * 匹配规则为路径匹配，例如：
         * action：Action_Show_Home
         * model：Services_Data_ApiData
         * 
         */
        let loaderlist = [{
            path: '/app/' + appName + '/action',
            match: '/app/' + appName
        }, {
            path: '/app/' + appName + '/model',
            match: '/app/' + appName + '/model'
        },{
            path: '/src/' + appName + '/app',// 因为无法知道具体ssr项目下的某个子项目的名称，所以依然采用根目录排除法
            match: '/src/' + appName + '/app',
            name: 'index'
        }];
        for (let i = 0; i < loaderlist.length; i++) {

            bun.Loader(
                loaderlist[i]['match'],
                loaderlist[i]['path'], 
                loaderlist[i]['name'] || '*', 
                App.prototype, 
                'async'
            );
        }
    }
}

module.exports = Nb_Init;