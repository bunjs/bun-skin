"use strict";
module.exports = (bun) => {
    class Exception extends Error {
        constructor(arg) {
            super();
            const { level, code, msg } = arg;
            this.name = "Exception";
            this.level = level || "error";
            this.code = code || '000';
            this.msg = msg || "程序异常";
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
    return Exception;
};
//# sourceMappingURL=Exception.js.map