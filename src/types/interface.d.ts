interface IParams {
    ROOT_PATH: string;
    port: string | number;
    isSingle: boolean;
}
interface IApps {
    [index: string]: IApp;
}
interface IApp {
    class: typeof IIApp;
    router?: IRoutes;
    name?: string;
    path?: string;
}
interface IPlugin {
    enable: string;
    path?: string;
    package?: string;
}
interface IPlugins {
    [index: string]: IPlugin;
}

interface ILoaderParams {
    keypath?: string;
    path: string;
    context?: any;
    type?: string;
    ignore?: string[];
    isRequired?: boolean;
    isGetMap?: boolean;
}

interface IGlobalPath {
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
interface IGlobalModuleMap {
    [key: string]: string;
}
type IGetFuncName = (path: string, keypath: string) => string;
type ILoaderFunc = (obj: ILoaderParams) => void;
type IGetGlobalModule = (loadList: any, appName?: string) => void;
type IGetGlobalModuleByPath = (loaderItem: ILoaderParams, appName?: string) => IGlobalModuleMap;
interface ILoader {
    getFuncName: IGetFuncName;
    loader: ILoaderFunc;
    getGlobalModule: IGetGlobalModule;
    getGlobalModuleByPath: IGetGlobalModuleByPath;
}
type IRenderHtml = (_view: string, locals: any) => Promise<any>;
type IRender = (_view: string, locals: any) => Promise<any>;

