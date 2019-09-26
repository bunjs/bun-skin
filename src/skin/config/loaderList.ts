
/**
 * 将action层和model层下的类使用loader直接作为公共类属性
 * 匹配规则为路径匹配，例如：
 * action：Action_Show_Home
 * model：Services_Data_ApiData
 * 
 */

export const mvcLoaderList = [
    {
        path: '/action',
        isRequired: true
    }, {
        path: '/controller',
        isRequired: true
    }, {
        path: '/model',
        isRequired: true
    }
];