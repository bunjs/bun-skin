
/**
 * 将action层和model层下的类使用loader直接作为公共类属性
 * 匹配规则为路径匹配，例如：
 * action：Action_Show_Home
 * model：Services_Data_ApiData
 * 
 */
export const appLoaderList = (appName: string): any => {
    return [
        // {
        //     path: '/src/' + appName + '/app/base/index.js',
        //     match: '/src/' + appName + '/app',
        //     isNecessary: false
        // }
    ];
};

export const mvcLoaderList = [
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