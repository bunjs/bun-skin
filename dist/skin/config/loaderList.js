"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appLoaderList = (appName) => {
    return [];
};
exports.mvcLoaderList = [
    {
        path: '/action',
        isNecessary: true
    }, {
        path: '/controller',
        isNecessary: true
    }, {
        path: '/model',
        isNecessary: true
    }
];
//# sourceMappingURL=loaderList.js.map