/**
 * 主启动入口
 */
const Koa = require('koa')
const views = require('./middleware/Render.js')
const catchError = require('./middleware/CatchError.js')
const serverStaic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const Nb_Init = require('./Init.js');

module.exports = function (params) {
    /**
     * 接受参数
     * @params ROOT_PATH app根目录执行路径
     * @params port 启动端口号 默认4000
     */
    let _adapter = {
        ROOT_PATH: '',
        port: 4000
    }
    for (let i in _adapter) { 
        if (_adapter.hasOwnProperty(i)) {
            _adapter[i] = params[i] || _adapter[i];
        }
    }
    
    const app = new Koa()
    const port = process.env.PORT || _adapter.port;
    global.window = global.window || {
        config: {}
    };

    // 定义全局路径
    bun.ROOT_PATH = _adapter.ROOT_PATH;
    bun.LOG_PATH = bun.ROOT_PATH + '/logs';
    bun.CONF_PATH = bun.ROOT_PATH + '/conf';
    bun.PLUGINS_PATH = bun.ROOT_PATH + '/plugins';
    bun.APP_PATH = bun.ROOT_PATH + '/app';
    bun.LIB_PATH = bun.ROOT_PATH + '/libs';
    bun.TPL_PATH = bun.ROOT_PATH + '/template';
    bun.MODULES_PATH = bun.ROOT_PATH + '/node_modules';

    bun.app = app;

    const logger = require('./Logger.js');
    bun.Logger = logger;

    // 捕捉全部请求到日志
    bun.app.use(logger.log4js.koaLogger(logger.reqLog(), {
        format: '[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]', level: 'auto' 
    }));
    
    // 全局捕获错误
    app.use(catchError);
    app.use(serverStaic(bun.ROOT_PATH+'/static'));
    app.use(bodyParser())
    app.use(views(bun.ROOT_PATH+'/template', {
      ext: 'html'
    }))

    //解决后端渲染前端资源时遇到css相关文件报错的问题
    var Module = require('module');
    Module._extensions['.less'] = function(module, fn) {
      return '';
    };
    Module._extensions['.css'] = function(module, fn) {
      return '';
    };

    new Nb_Init().init();

    app.listen(port);

    console.log('start on' + port);

}
