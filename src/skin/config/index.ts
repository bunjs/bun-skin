import err = require('./err');
import globalPath = require('./globalPath');
import {appLoaderList, mvcLoaderList} from './loaderList';

const viewExt: string = 'html';
const defaultPort: string | number = 8000;

export {
    globalPath,
    appLoaderList,
    mvcLoaderList,
    err,
    viewExt,
    defaultPort
};