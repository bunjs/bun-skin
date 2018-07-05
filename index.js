'use strict';
/**
 * @namespace bun
 */
global.bun = {};

/**
 * Start bun Logger with cluster mode
 * @since 1.0.0
 */
exports.Logger = bun.Logger = require('./dist/Logger.js');
/**
 * Start bun Routes with cluster mode
 * @since 1.0.0
 */
exports.Bootstrap = bun.Bootstrap = require('./dist/Bootstrap.js');

/**
 * Start bun Loader with cluster mode
 * @since 1.0.0
 */
exports.Loader = bun.Loader =  require('./dist/Loader.js');

/**
 * Start bun Routes with cluster mode
 * @since 1.0.0
 */
exports.Routes = bun.Routes = require('./dist/Routes.js');




