"use strict";
const Bun = require("./Bun");
const core = require("./Core");
const utils_1 = require("./utils");
module.exports = (params) => {
    try {
        global.bun = new Bun("bun", params);
        utils_1.run(core.start(params.port || 8000), core.setPlugins, core.setRouter, core.initAllApps, core.setGlobalModule, core.setLib, core.setViews, core.setBodyParser, core.setServerStaic, core.setRal, core.setReqLog, core.setErrHandle, core.setException)(bun);
    }
    catch (e) {
        bun.Logger.bunerr(e);
    }
};
//# sourceMappingURL=Bootstrap.js.map