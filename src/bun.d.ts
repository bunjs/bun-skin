/// <reference path="./types/Routes.d.ts" />
/// <reference path="./types/Exception.d.ts" />
/// <reference path="./types/interface.d.ts" />
/// <reference path="./types/App.d.ts" />
declare class Bun {
    public name: string;
    public Logger: any;
    public Routes: IRoutes;
    public use: any;
    public Loader: ILoader;
    public plugins: any;
    public lib: object;
    public app?: IApp;
    public apps?: IApps;
    public context: any;
    public globalPath: IGlobalPath;
    public globalModule: any;
    public isSingle: boolean;
    public port: number | string;
    public Exception: IException;

    public constructor(name: string, options: IParams);

    public emitter(eventName: string, freeze? : any): void;
    public bootstrap(): void;
}