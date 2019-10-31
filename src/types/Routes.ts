export interface IGETPOST {
    [key: string]: any;
}
export interface IRoutesHandle {
    get: IGETPOST;
    post: IGETPOST;
}
export class IRoutes {
    public appName?: string;
    public routesHandle: IRoutesHandle;
    public get: (obj: IGETPOST) => void;
    public post: (obj: IGETPOST) => void;
    public mergeAppRoutes: (appRoutesHandle: IRoutesHandle) => void;
    // private initCallback: (path: string) => any;

    constructor(appName?: string) {
        this.appName = appName || "";
        this.routesHandle = {
            get: {},
            post: {},
        };
    }
}
// export interface IRoutes {
//     appName?: string;
//     routesHandle: IRoutesHandle;

//     get(obj: IGETPOST): void;
//     post(obj: IGETPOST): void;
//     mergeAppRoutes(appRoutesHandle: IRoutesHandle): void;
//     initCallback(path: string): Promise<any>;
// }