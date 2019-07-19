module.exports = (ROOT_PATH) => {
	return {
		ROOT_PATH: ROOT_PATH,
		LOG_PATH: ROOT_PATH + '/logs',
		CONF_PATH: ROOT_PATH + '/conf',
		PLUGINS_PATH: ROOT_PATH + '/plugins',
		APP_PATH: ROOT_PATH + '/app',
		LIB_PATH: ROOT_PATH + '/lib',
		TPL_PATH: ROOT_PATH + '/template',
		STATIC_PATH: ROOT_PATH + '/static',
		MODULES_PATH: ROOT_PATH + '/node_modules'
	}
}