import Koa = require("koa");
import {
    IContext
} from "./Context";

export interface IBun extends Koa {
    name: string;
    Logger: any;
    Routes: typeof IRoutes;
    use: any;
    Loader: ILoader;
    plugins: any;
    lib: any;
    app?: IApp;
    apps?: IApps;
    context: IContext;
    globalPath: IGlobalPath;
    globalModule: any;
    isSingle: boolean;
    port: number | string;
    Exception: typeof IException;

    emitter(eventName: string, freeze? : any): void;
    bootstrap(): void;
}