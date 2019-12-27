interface IGETPOST {
    [key: string]: any;
}
interface IRoutesHandle {
    get: IGETPOST;
    post: IGETPOST;
}
declare class IRoutes {
    public appName?: string;
    public routesHandle: IRoutesHandle;
    public get: (obj: IGETPOST) => void;
    public post: (obj: IGETPOST) => void;
    public mergeAppRoutes: (appRoutesHandle: IRoutesHandle) => void;
    // private initCallback: (path: string) => any;

    public constructor(appName?: string);
}
// export interface IRoutes {
//     appName?: string;
//     routesHandle: IRoutesHandle;

//     get(obj: IGETPOST): void;
//     post(obj: IGETPOST): void;
//     mergeAppRoutes(appRoutesHandle: IRoutesHandle): void;
//     initCallback(path: string): Promise<any>;
// }