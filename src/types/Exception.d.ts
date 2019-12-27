interface IExceptionArgs {
    code: string | number;
    msg: string;
    level: string;
}

declare class IException extends Error {
    public name: string;
    public level?: string;
    public code?: string | number;
    public msg?: string;
    public toString: () => string;
    public constructor(arg: IExceptionArgs);
}