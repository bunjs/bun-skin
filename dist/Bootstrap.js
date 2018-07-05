'use strict';

/**
 * 主启动入口
 */
const Koa = require('koa');
const views = require('./middleware/Render.js');
const catchError = require('./middleware/CatchError.js');
const serverStaic = require('koa-static');
const bodyParser = require('koa-bodyparser');
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
    };
    for (let i in _adapter) {
        if (_adapter.hasOwnProperty(i)) {
            _adapter[i] = params[i] || _adapter[i];
        }
    }

    const app = new Koa();
    const port = process.env.PORT || _adapter.port;
    global.window = global.window || {
        config: {}
    };
    bun.ROOT_PATH = _adapter.ROOT_PATH;
    bun.app = app;

    // 全局捕获错误
    app.use(catchError);
    app.use(serverStaic(bun.ROOT_PATH + '/static'));
    app.use(bodyParser());
    app.use(views(bun.ROOT_PATH + '/template', {
        ext: 'html'
    }));

    var Module = require('module');
    Module._extensions['.less'] = function (module, fn) {
        return '';
    };
    Module._extensions['.css'] = function (module, fn) {
        return '';
    };

    new Nb_Init().init();

    app.listen(port);

    console.log('start on' + port);
};