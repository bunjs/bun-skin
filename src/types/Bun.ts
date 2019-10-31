import Koa = require("koa");
import {
    IException
} from "./Exception";
import {
    IApp,
    IApps,
    IContext,
    IGlobalPath,
    ILoader
} from "./interface";
import {
    IRoutes
} from "./Routes";

export interface IBun extends Koa {
    name: string;
    Logger: any;
    Routes: typeof IRoutes;
    use: any;
    Loader: ILoader;
    plugins: any;
    lib: any;
    app: IApps | IApp;
    context: IContext;
    globalPath: IGlobalPath;
    globalModule: any;
    isSingle: boolean;
    port: number | string;
    Exception: typeof IException;

    emitter(eventName: string, freeze? : any): void;
    bootstrap(): void;
}