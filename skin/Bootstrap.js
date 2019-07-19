/**
 * 主启动入口
 */
const Bun = require('./Core.js');

/**
 * 接受参数
 * @params ROOT_PATH app根目录执行路径
 * @params port 启动端口号 默认4000
 */
module.exports = function (params) {
	try {
		global.bun = new Bun('bun', params);
	    bun.setException();
	    bun.setErrHandle();
	    bun.setReqLog();
	    bun.setServerStaic();
	    bun.setBodyParser();
	    bun.setViews();
	    bun.setLib();
	    bun.initAllApps();
	    bun.setRouter();
	    bun.setPlugins();
	    bun.run(params.port);
	} catch(e) {
		if (e instanceof Exception) {
    		ctx.body = JSON.stringify({
    			code: e.code,
    			msg: e.msg
    		});
    	}
    	else if (e instanceof Error) {
    		ctx.status = 500;
	        ctx.body = '500 服务器错误';
	        bun.Logger.bunerr(e);
    	}
	}
}
