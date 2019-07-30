import err = require('./err');
import globalPath = require('./globalPath');
import loaderList = require('./loaderList');

const viewExt: string = 'html';
const defaultPort: string | number = 8000;

export {
    globalPath,
    loaderList,
    err,
    viewExt,
    defaultPort
};