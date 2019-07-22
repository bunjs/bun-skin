"use strict";
class Exception extends Error {
    constructor({ code = "000", msg = "程序异常", level = "error" }) {
        super(msg);
        this.name = "Exception";
        this.level = level;
        this.code = code;
        this.msg = msg;
        Error.captureStackTrace(this, this.constructor);
        const errorToLogMap = {
            info: () => bun.Logger.info(this.stack),
            debug: () => bun.Logger.debug(this.stack),
            error: () => bun.Logger.error(this.stack),
            warn: () => bun.Logger.warn(this.stack),
            fatal: () => bun.Logger.fatal(this.stack),
            bunwarn: () => bun.Logger.bunwarn(this.stack),
            bunerr: () => bun.Logger.bunerr(this.stack),
        };
        errorToLogMap[level]();
    }
    toString() {
        return this.msg;
    }
}
module.exports = Exception;
//# sourceMappingURL=Exception.js.map