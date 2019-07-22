
/**
 * 将action层和model层下的类使用loader直接作为公共类属性
 * 匹配规则为路径匹配，例如：
 * action：Action_Show_Home
 * model：Services_Data_ApiData
 * 
 */
export = (appName: string) => {
    return [{
        path: '/app/' + appName + '/action',
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
}