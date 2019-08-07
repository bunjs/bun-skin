"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appLoaderList = (appName) => {
    return [{
            path: '/src/' + appName + '/app/base/index.js',
            match: '/src/' + appName + '/app',
            isNecessary: false
        }];
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