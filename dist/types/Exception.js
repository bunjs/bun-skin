"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IException extends Error {
    constructor(arg) {
        super();
        const { level, code, msg } = arg;
        this.name = "Exception";
        this.level = level || "error";
        this.code = code || '000';
        this.msg = msg || "程序异常";
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.IException = IException;
//# sourceMappingURL=Exception.js.map