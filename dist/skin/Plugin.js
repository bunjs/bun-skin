"use strict";
module.exports = () => {
    const pluginsConf = require(bun.globalPath.CONF_PATH + "/plugins.js");
    const context = bun.plugins;
    let Model;
    for (const [key, value] of Object.entries(pluginsConf)) {
        if (value.enable) {
            try {
                if (value.path) {
                    Model = require(value.path + "/index.js");
                }
                else {
                    Model = require(bun.globalPath.MODULES_PATH + "/" + value.package + "/index.js");
                }
            }
            catch (e) {
                bun.Logger.bunerr(e);
            }
            if (context[key]) {
                bun.Logger.bunwarn("Repeated plugin name: " + key + " in file: " + key);
            }
            context[key] = (() => {
                return Model;
            })();
        }
    }
};
//# sourceMappingURL=Plugin.js.map