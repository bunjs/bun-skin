"use strict";

const log4js = require('koa-log4');

module.exports = function (LOG_PATH) {
  log4js.configure({
    appenders: {
      reqLog: {
        type: 'dateFile',
        filename: LOG_PATH + '/app/req.log',
        pattern: '.yyyy-MM-dd-hh',
        compress: true
      },
      app: {
        type: 'dateFile',
        filename: LOG_PATH + '/app/app-worker.log',
        pattern: '.yyyy-MM-dd-hh',
        compress: true
      },
      apperr: {
        type: 'dateFile',
        filename: LOG_PATH + '/app/app-worker.log.wf',
        pattern: '.yyyy-MM-dd-hh',
        compress: true
      },
      bunko: {
        type: 'dateFile',
        filename: LOG_PATH + '/bun/bun-worker.log.wf',
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
  return {
    log4js: log4js,
    reqLog: function reqLog() {
      return log4js.getLogger('reqLog');
    },
    debug: function debug(str) {
      log4js.getLogger('app').info(str);
    },
    info: function info(str) {
      log4js.getLogger('app').info(str);
    },
    warn: function warn(str) {
      log4js.getLogger('apperr').warn(str);
    },
    error: function error(str) {
      log4js.getLogger('apperr').error(str);
    },
    fatal: function fatal(str) {
      log4js.getLogger('apperr').fatal(str);
    },
    bunerr: function bunerr(str) {
      log4js.getLogger('bunko').error(str);
    },
    bunwarn: function bunwarn(str) {
      log4js.getLogger('bunko').warn(str);
    }
  };
};