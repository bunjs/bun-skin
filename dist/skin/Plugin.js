"use strict";
module.exports = (bun) => {
    const pluginsConf = require(bun.globalPath.CONF_PATH + '/plugins.js');
    let Model;
    for (const [key, value] of Object.entries(pluginsConf)) {
        if (value.enable) {
            try {
                if (value.path) {
                    Model = require(value.path + '/index.js');
                }
                else {
                    Model = require(value.package);
                }
            }
            catch (e) {
                bun.Logger.bunerr(e);
            }
            if (bun.plugins[key]) {
                bun.Logger.bunwarn('Repeated plugin name: ' + key + ' in file: ' + key);
            }
            bun.plugins[key] = (() => {
                return Model;
            })();
        }
    }
};
//# sourceMappingURL=Plugin.js.map