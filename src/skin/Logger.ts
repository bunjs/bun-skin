import log4js = require("koa-log4");

export = (LOG_PATH: string) => {
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
            ral: {
                type: "dateFile",
                filename: LOG_PATH + "/ral/ral.log",
                pattern: ".yyyy-MM-dd-hh",
                compress: true,
            },
            ralerr: {
                type: "dateFile",
                filename: LOG_PATH + "/ral/ral.log.wf",
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
            ral: {
                appenders: ["ral"],
                level: "debug",
            },
            ralerr: {
                appenders: ["ralerr"],
                level: "debug",
            }
        },
    });
    return {
        log4js,
        reqLog() {
            return log4js.getLogger("reqLog");
        },
        debug(str: string) {
            log4js.getLogger("app").info(str);
        },
        info(str: string) {
            log4js.getLogger("app").info(str);
        },
        warn(str: string) {
            log4js.getLogger("apperr").warn(str);
        },
        error(str: string) {
            log4js.getLogger("apperr").error(str);
        },
        fatal(str: string) {
            log4js.getLogger("apperr").fatal(str);
        },
        bunerr(str: string) {
            log4js.getLogger("bunko").error(str);
        },
        bunwarn(str: string) {
            log4js.getLogger("bunko").warn(str);
        },
        ralnotice(str: string) {
            log4js.getLogger("ral").info(str);
        },
        ralwarning(str: string) {
            log4js.getLogger("ralerr").warn(str);
        },
        raltrace(str: string) {
            log4js.getLogger("ralerr").trace(str);
        },
        ralfatal(str: string) {
            log4js.getLogger("ralerr").fatal(str);
        },
        raldebug(str: string) {
            log4js.getLogger("ral").info(str);
        },
    };
};
