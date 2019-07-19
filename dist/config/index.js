"use strict";

const globalPath = require('./globalPath');

const loaderList = require('./loaderList');

const err = require('./err');

module.exports = {
  globalPath,
  loaderList,
  err,
  viewExt: 'html',
  defaultPort: 8000
};