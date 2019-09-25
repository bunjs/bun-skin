"use strict";
const Bun = require("./Core");
module.exports = (params) => {
    try {
        global.bun = new Bun("bun", params);
        bun.setException();
        bun.setErrHandle();
        bun.setReqLog();
        bun.setRal();
        bun.setServerStaic();
        bun.setBodyParser();
        bun.setViews();
        bun.setLib();
        bun.setGlobalModule();
        bun.initAllApps();
        bun.setRouter();
        bun.setPlugins();
        bun.run(params.port);
    }
    catch (e) {
        bun.Logger.bunerr(e);
    }
};
//# sourceMappingURL=Bootstrap.js.map