export interface Params {
    ROOT_PATH: string;
    port: string | number;
}
export interface Apps {
    [index: string]: App;
}
export interface App {
    router?: any;
    name?: string;
    class?: any;
    path?: string;
}
export interface Plugin {
    enable: string;
    path?: string;
    package?: string;
}
export interface Plugins {
    [index: string]: Plugin;
}
export interface Router {
    [index: string]: string;
}
export interface Loader {
    keypath?: string;
    path: string;
    context?: any;
    type?: string;
    ignore?: string[];
    isRequired?: boolean;
    isGetMap?: boolean;
}