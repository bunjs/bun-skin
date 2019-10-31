import {
    IBun
} from "../types/Bun";
import { IPlugins } from "../types/interface";

export = (bun: IBun) => {
    const pluginsConf: IPlugins = require(bun.globalPath.CONF_PATH + "/plugins.js");
    let Model: any;
    for (const [key, value] of Object.entries(pluginsConf)) {
        if (value.enable) {
            // 将插件根据配置加入全局变量bun中
            // 以path属性为先
            try {
                if (value.path) {
                    Model = require(value.path + "/index.js");
                } else {
                    Model = require(bun.globalPath.MODULES_PATH + "/" + value.package + "/index.js");
                }
            } catch (e) {
                bun.Logger.bunerr(e);
            }

            if (bun.plugins[key]) {
                // 如果模块已存在作用域中，则报警并覆盖
                bun.Logger.bunwarn("Repeated plugin name: " + key + " in file: " + key);
            }
            bun.plugins[key] = (() => {
                return Model;
            })();
        }
    }
};