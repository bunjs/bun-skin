'use strict';

/**
 * See: http://mozilla.github.io/nunjucks/api.html#configure
 * @param  {[type]} path nunjucks configure path
 * @param  {[type]} opts nunjucks configure opts
 * @return {[type]}      [description]
 */
module.exports = (ctx, next) => {
    try {
        next();
    }
    catch (e) {
        bun.Logger.error(e);
    }
    return;
};