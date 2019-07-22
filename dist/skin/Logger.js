"use strict";
const log4js = require("koa-log4");
module.exports = (LOG_PATH) => {
    log4js.configure({
        appenders: {
            reqLog: {
                type: "dateFile",
                filename: LOG_PATH + "/app/req.log",
                pattern: ".yyyy-MM-dd-hh",
                compress: true,
            },
            app: {
                type: "dateFile",
                filename: LOG_PATH + "/app/app-worker.log",
                pattern: ".yyyy-MM-dd-hh",
                compress: true,
            },
            apperr: {
                type: "dateFile",
                filename: LOG_PATH + "/app/app-worker.log.wf",
                pattern: ".yyyy-MM-dd-hh",
                compress: true,
            },
            bunko: {
                type: "dateFile",
                filename: LOG_PATH + "/bun/bun-worker.log.wf",
                pattern: ".yyyy-MM-dd-hh",
                compress: true,
            },
        },
        categories: {
            default: {
                appenders: ["app"],
                level: "debug",
            },
            reqLog: {
                appenders: ["reqLog"],
                level: "debug",
            },
            apperr: {
                appenders: ["apperr"],
                level: "error",
            },
            app: {
                appenders: ["app"],
                level: "info",
            },
            bunko: {
                appenders: ["bunko"],
                level: "debug",
            },
        },
    });
    return {
        log4js,
        reqLog() {
            return log4js.getLogger("reqLog");
        },
        debug(str) {
            log4js.getLogger("app").info(str);
        },
        info(str) {
            log4js.getLogger("app").info(str);
        },
        warn(str) {
            log4js.getLogger("apperr").warn(str);
        },
        error(str) {
            log4js.getLogger("apperr").error(str);
        },
        fatal(str) {
            log4js.getLogger("apperr").fatal(str);
        },
        bunerr(str) {
            log4js.getLogger("bunko").error(str);
        },
        bunwarn(str) {
            log4js.getLogger("bunko").warn(str);
        },
    };
};
//# sourceMappingURL=Logger.js.map