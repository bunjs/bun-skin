
/**
 * Exception异常类（扩展自Error)
 * 默认调用此类均会打log，并且错误信息会展现在前端
 *
 * @params String name Exception
 * @params String level 异常等级
 * @params String code 异常码
 * @params String msg 异常描述
 * @params Function toString 返回异常描述
 */
class Exception extends Error {
  public name: string;
  public level: string;
  public code: string | number;
  public msg: string;
  constructor({ code = "000", msg = "程序异常", level = "error" }) {
      super(msg);
      this.name = "Exception";
      this.level = level;
      this.code = code;
      this.msg = msg;
      Error.captureStackTrace(this, this.constructor);

      const errorToLogMap: any = {
          info: () => bun.Logger.info(this.stack),
          debug: () => bun.Logger.debug(this.stack),
          error: () => bun.Logger.error(this.stack),
          warn: () => bun.Logger.warn(this.stack),
          fatal: () => bun.Logger.fatal(this.stack),
          bunwarn: () => bun.Logger.bunwarn(this.stack),
          bunerr: () => bun.Logger.bunerr(this.stack),
      };
      errorToLogMap[level]();
  }
  public toString() {
      return this.msg;
  }
}
export = Exception;