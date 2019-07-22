/**
 * 主启动入口
 */
import { Params } from "../interface";
import Bun = require("./Core");

/**
 * 接受参数
 * @params ROOT_PATH app根目录执行路径
 * @params port 启动端口号 默认4000
 */
export = (params: Params) => {
    // let bun: any;
    try {
        (global as any).bun = new Bun("bun", params);
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
    } catch (e) {
        bun.Logger.bunerr(e);
    }
};
