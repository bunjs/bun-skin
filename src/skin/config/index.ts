import err = require('./err');
import globalPath = require('./globalPath');
import {mvcLoaderList} from './loaderList';

const viewExt: string = 'html';
const defaultPort: string | number = 8000;

export {
    globalPath,
    mvcLoaderList,
    err,
    viewExt,
    defaultPort
};