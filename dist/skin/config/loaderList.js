"use strict";
module.exports = (appName) => {
    return [{
            path: '/app/' + appName + '/action',
            match: '/app/' + appName,
            isNecessary: true
        }, {
            path: '/app/' + appName + '/controller',
            match: '/app/' + appName,
            isNecessary: true
        }, {
            path: '/app/' + appName + '/model',
            match: '/app/' + appName + '/model',
            isNecessary: true
        }, {
            path: '/src/' + appName + '/app/base',
            match: '/src/' + appName + '/app',
            name: 'index',
            isNecessary: false
        }];
};
//# sourceMappingURL=loaderList.js.map