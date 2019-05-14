"use strict";

module.exports = {
  globalPath: ROOT_PATH => {
    return {
      ROOT_PATH: ROOT_PATH,
      LOG_PATH: ROOT_PATH + '/logs',
      CONF_PATH: ROOT_PATH + '/conf',
      PLUGINS_PATH: ROOT_PATH + '/plugins',
      APP_PATH: ROOT_PATH + '/app',
      LIB_PATH: ROOT_PATH + '/libs',
      TPL_PATH: ROOT_PATH + '/template',
      STATIC_PATH: ROOT_PATH + '/static',
      MODULES_PATH: ROOT_PATH + '/node_modules'
    };
  },
  viewExt: 'html',
  port: 8000,

  /**
      * 将action层和model层下的类使用loader直接作为公共类属性
      * 匹配规则为路径匹配，例如：
      * action：Action_Show_Home
      * model：Services_Data_ApiData
      * 
      */
  loaderList: appName => {
    return [{
      path: '/app/' + appName + '/action',
      match: '/app/' + appName,
      isNecessary: true
    }, {
      path: '/app/' + appName + '/model',
      match: '/app/' + appName + '/model',
      isNecessary: true
    }, {
      path: '/src/' + appName + '/app',
      // 因为无法知道具体ssr项目下的某个子项目的名称，所以依然采用根目录排除法
      match: '/src/' + appName + '/app',
      name: 'index',
      isNecessary: false
    }];
  }
};