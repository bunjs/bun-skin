import Koa = require("koa");
import {
    IException
} from "./types/Exception";
import {
    IApp,
    IApps,
    IContext,
    IGlobalPath,
    ILoader
} from "./types/interface";
import {
    IRoutes
} from "./types/Routes";

declare module 'bun' {
    export class Bun extends Koa {
        public name: string;
        public Logger: any;
        public Routes: IRoutes;
        public use: any;
        public Loader: ILoader;
        public plugins: object;
        public lib: object;
        public app: IApps | IApp;
        public context: IContext;
        public globalPath: IGlobalPath;
        public globalModule: any;
        public isSingle: boolean;
        public port: number | string;
        public Exception: IException;

        public emitter(eventName: string, freeze? : any): void;
        public bootstrap(): void;
    }
    export function exception (bun: Bun): IException;
    
}