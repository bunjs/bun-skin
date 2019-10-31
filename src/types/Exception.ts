export interface IExceptionArgs {
    code: string | number;
    msg: string;
    level: string;
}

export class IException extends Error {
    public name: string;
    public level?: string;
    public code?: string | number;
    public msg?: string;
    public toString: () => string;
    constructor(arg: IExceptionArgs) {
        super();
        const {level, code, msg} = arg;
        this.name = "Exception";
        this.level = level || "error";
        this.code = code || '000';
        this.msg = msg || "程序异常";
        Error.captureStackTrace(this, this.constructor);
    }
}