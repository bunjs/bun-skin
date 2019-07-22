import { Plugins } from "../interface";
export = () => {
    const pluginsConf: Plugins = require(bun.globalPath.CONF_PATH + "/plugins.js");
    const context = bun.plugins;
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

            if (context[key]) {
                // 如果模块已存在作用域中，则报警并覆盖
                bun.Logger.bunwarn("Repeated plugin name: " + key + " in file: " + key);
            }
            context[key] = (() => {
                return Model;
            })();
        }
    }
};