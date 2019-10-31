import Koa = require("koa");
import {
    IException
} from "./Exception";

export interface IParams {
    ROOT_PATH: string;
    port: string | number;
    isSingle: boolean;
}
export interface IApps {
    [index: string]: IApp;
}
export interface IApp {
    router?: any;
    name?: string;
    class?: any;
    path?: string;
}
export interface IPlugin {
    enable: string;
    path?: string;
    package?: string;
}
export interface IPlugins {
    [index: string]: IPlugin;
}

export interface ILoaderParams {
    keypath?: string;
    path: string;
    context?: any;
    type?: string;
    ignore?: string[];
    isRequired?: boolean;
    isGetMap?: boolean;
}

export interface IGlobalPath {
    readonly ROOT_PATH: string;
    readonly LOG_PATH: string;
    readonly CONF_PATH: string;
    readonly PLUGINS_PATH: string;
    readonly APP_PATH: string;
    readonly LIB_PATH: string;
    readonly TPL_PATH: string;
    readonly STATIC_PATH: string;
    readonly MODULES_PATH: string;
}
export interface IGlobalModuleMap {
    [key: string]: string;
}
export type IGetFuncName = (path: string, keypath: string) => string;
export type ILoaderFunc = (obj: ILoaderParams) => void;
export type IGetGlobalModule = (loadList: any, appName?: string) => void;
export type IGetGlobalModuleByPath = (loaderItem: ILoaderParams, appName?: string) => IGlobalModuleMap;
export interface ILoader {
    getFuncName: IGetFuncName;
    loader: ILoaderFunc;
    getGlobalModule: IGetGlobalModule;
    getGlobalModuleByPath: IGetGlobalModuleByPath;
}
export type IRenderHtml = (_view: string, locals: any) => Promise<any>;
export type IRender = (_view: string, locals: any) => Promise<any>;
export interface IContext extends Koa.Context {
    bun: IContextUtil;
    renderHtml: IRenderHtml;
    render: IRender;
}
export interface IContextUtil {
    Loader: ILoader;
    Logger: any;
    globalPath: IGlobalPath;
    isSingle: boolean;
    app: IApps | IApp;
    Exception: typeof IException;
}
