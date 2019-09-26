/**
 * 主启动入口
 */

import { Params } from "../interface";
import Bun = require("./Bun");
import core = require("./Core");
import { run } from "./utils";

/**
 * 接受参数
 * @params ROOT_PATH app根目录执行路径
 * @params port 启动端口号 默认8000
 */
export = (params: Params) => {
    try {
        (global as any).bun = new Bun("bun", params);
        run(
            core.start(params.port || 8000),
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
            core.setException,
        )(bun);
    } catch (e) {
        bun.Logger.bunerr(e);
    }
};
