'use strict';

const log4js = require('koa-log4');
log4js.configure({
	appenders: {
		reqLog: {
			type: 'dateFile',
			filename: bun.LOG_PATH + '/app/req.log',
			pattern: '.yyyy-MM-dd-hh',
			compress: true
		},
		app: {
			type: 'dateFile',
			filename: bun.LOG_PATH + '/app/app-worker.log',
			pattern: '.yyyy-MM-dd-hh',
			compress: true
		},
		apperr: {
			type: 'dateFile',
			filename: bun.LOG_PATH + '/app/app-worker.log.wf',
			pattern: '.yyyy-MM-dd-hh',
			compress: true
		},
		bunko: {
			type: 'dateFile',
			filename: bun.LOG_PATH + '/bun/bun-worker.log.wf',
			pattern: '.yyyy-MM-dd-hh',
			compress: true
		}
	},
	categories: {
		default: {
			appenders: ['app'],
			level: 'debug'
		},
		reqLog: {
			appenders: ['reqLog'],
			level: 'debug'
		},
		apperr: {
			appenders: ['apperr'],
			level: 'error'
		},
		app: {
			appenders: ['app'],
			level: 'info'
		},
		bunko: {
			appenders: ['bunko'],
			level: 'debug'
		}
	}
});

// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');

module.exports = {
	log4js: log4js,
	reqLog: function () {
		return log4js.getLogger('reqLog');
	},
	debug: function (str) {
		log4js.getLogger('app').info(str);
	},
	info: function (str) {
		log4js.getLogger('app').info(str);
	},
	warn: function (str) {
		log4js.getLogger('apperr').warn(str);
	},
	error: function (str) {
		log4js.getLogger('apperr').error(str);
	},
	fatal: function (str) {
		log4js.getLogger('apperr').fatal(str);
	},
	bunerr: function (str) {
		log4js.getLogger('bunko').error(str);
	},
	bunwarn: function (str) {
		log4js.getLogger('bunko').warn(str);
	}
};