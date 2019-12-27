declare class IIApp {
    public Routes: IRoutes;
    public appName?: string;
    public ral?: Promise<any>;
    
    public constructor();
    public execute(ctx: any): Promise<void> | any;
    public getAppConf(filename: string): any;
    public getConf(filename: string): any;
}