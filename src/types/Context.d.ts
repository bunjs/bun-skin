import Koa = require("koa");
interface IContextUtil {
    Loader: ILoader;
    Logger: any;
    globalPath: IGlobalPath;
    isSingle: boolean;
    app: IApps | IApp;
    Exception: typeof IException;
}
interface IContext extends Koa.Context {
    bun: IContextUtil;
    renderHtml: IRenderHtml;
    render: IRender;
}