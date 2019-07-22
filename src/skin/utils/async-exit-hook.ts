const noop = function() {};
const defaultOptions = {
    onExitDone: noop,
    onExit: noop,
    asyncTimeoutMs: 10000
};

type exitFunc = (err: Error | null, callback: () => void) => void;
type exitDoneFunc = (code: number) => void;

interface IExitHookOptions {
    onExit: exitFunc;
    onExitDone ? : exitDoneFunc;
    asyncTimeoutMs ? : number;
}

interface IEvents {
    [key: string]: any;
}

interface IFilters {
    [key: string]: any[];
}

class ExitHook {
    public options: IExitHookOptions;
    public hooks: exitFunc[];
    public called: boolean;
    public waitingFor: number;
    public unhandledRejectionHooks: exitFunc[];
    public uncaughtExceptionHooks: exitFunc[];
    public events: IEvents;
    public filters: IFilters;

    constructor(options: IExitHookOptions) {
        this.options = { ...defaultOptions,
            ...options
        };
        this.hooks = [];
        this.called = false;
        this.waitingFor = 0;
        this.events = Object.create(null);
        this.filters = Object.create(null);
        this.unhandledRejectionHooks = [];
        this.uncaughtExceptionHooks = [];
        this.addHook(this.options.onExit);
    }

    addHook(exitFunc: exitFunc) {
        this.add(exitFunc);
        this.unhandledRejectionHandler(exitFunc);
        this.uncaughtExceptionHandler(exitFunc);
    }

    // Add a hook
    add(hook: exitFunc) {
        this.hooks.push(hook);
        if (this.hooks.length === 1) {
            this.hookEvent('exit');
            this.hookEvent('beforeExit', 0);
            this.hookEvent('SIGHUP', 128 + 1);
            // SIGINT代表 ctr+c 退出，标准 exit code 是130
            // 但使用npm script启动服务时，如果exit code不是0，会报错
            this.hookEvent('SIGINT', 0);
            // add.hookEvent('SIGINT', 128 + 2);
            this.hookEvent('SIGTERM', 128 + 15);
            this.hookEvent('SIGBREAK', 128 + 21);

            // PM2 Cluster shutdown message. Caught to support async handlers with pm2, needed because
            // explicitly calling process.exit() doesn't trigger the beforeExit event, and the exit
            // event cannot support async handlers, since the event loop is never called after it.
            this.hookEvent('message', 0, function(msg: string) { // eslint-disable-line prefer-arrow-callback
                if (msg !== 'shutdown') {
                    return true;
                }
            });
        }
    }

    // Add an unhandled rejection handler
    unhandledRejectionHandler(hook: exitFunc) {
        this.unhandledRejectionHooks.push(hook);
        if (this.unhandledRejectionHooks.length === 1) {
            this.events.unhandledRejection = this.exit.bind(this, true, 'unhandledRejection', 1);
            process.once('unhandledRejection', this.events.unhandledRejection);
        }
    }

    // Add an uncaught exception handler
    uncaughtExceptionHandler(hook: exitFunc) {
        this.uncaughtExceptionHooks.push(hook);

        if (this.uncaughtExceptionHooks.length === 1) {
            this.events.uncaughtException = this.exit.bind(this, true, 'uncaughtException', 1);
            process.once('uncaughtException', this.events.uncaughtException);
        }
    }

    // New signal / event to hook
    hookEvent(event: any, code ? : number, filter ? : Function) {
        const _this = this;
        this.events[event] = function() {
            const eventFilters = _this.filters[event];
            for (let i = 0; i < eventFilters.length; i++) {
                if (eventFilters[i].apply(this, arguments)) {
                    return;
                }
            }
            _this.exit(code !== undefined && code !== null, undefined, code);
        };

        if (!this.filters[event]) {
            this.filters[event] = [];
        }

        if (filter) {
            this.filters[event].push(filter);
        }
        process.on(event, this.events[event]);
    }

    // Unhook signal / event
    unhookEvent(event: string) {
        process.removeListener(event, this.events[event]);
        delete this.events[event];
        delete this.filters[event];
    }

    unhookAllEvent() {
        Object.keys(this.events).forEach((event) => {
            this.unhookEvent(event);
        });
    }

    exit(exit: boolean, type ? : string, code ? : number, err ? : Error) {
        const _this = this;
        let doExitDone = false;

        function doExit() {
            if (doExitDone) {
                return;
            }
            doExitDone = true;

            if (exit === true) {
                // All handlers should be called even if the exit-hook handler was registered first
                // process.nextTick(process.exit.bind(null, code))
                process.nextTick(() => {
                    // 真正退出
                    if (_this.options.onExitDone) {
                        _this.options.onExitDone(code!);
                    }
                    process.exit.call(null, code);
                });
            }
        }

        // Async hook callback, decrements waiting counter
        function stepTowardExit() {
            process.nextTick(() => {
                if (--_this.waitingFor === 0) {
                    doExit();
                }
            });
        }

        // Runs a single hook
        function runHook(syncArgCount: number, err: Error | null, hook: exitFunc) {
            // Cannot perform async hooks in `exit` event
            if (exit && hook.length > syncArgCount) {
                // Hook is async, expects a finish callback
                _this.waitingFor++;

                // if (err) {
                //   // Pass error, calling uncaught exception handlers
                //   return hook(err, stepTowardExit)
                // }
                // return hook(stepTowardExit)
                // 保证无论是否有错误，第一个参数都是err（无错误时，err === null）
                return hook(err, stepTowardExit);
            }

            // Hook is synchronous
            if (err) {
                // Pass error, calling uncaught exception handlers
                // 保证外部调用callback时，callback存在
                return hook(err, noop);
            }
            // 保证外部调用callback时，callback存在
            return hook(null, noop);
        }

        // Only execute hooks once
        if (_this.called) {
            return;
        }

        _this.called = true;

        // Run hooks
        if (err) {
            if (type === 'uncaughtException') {
                // Uncaught exception, run error hooks
                _this.uncaughtExceptionHooks.map(runHook.bind(null, 1, err));
            } else if (type === 'unhandledRejection') {
                _this.unhandledRejectionHooks.map(runHook.bind(null, 1, err));
            }
        } else {
            // hooks.map(runHook.bind(null, 0, null))
            // 不管哪种情况的退出，第一个参数都是null，第二个参数是callback
            // 也就是形参个数大于1才认为传递了callback，需要等待callback被执行
            _this.hooks.map(runHook.bind(null, 1, null));
        }

        if (_this.waitingFor) {
            // Force exit after x ms (10000 by default), even if async hooks in progress
            setTimeout(() => {
                doExit();
            }, _this.options.asyncTimeoutMs);
        } else {
            // No asynchronous hooks, exit immediately
            doExit();
        }
    }
}

module.exports = ExitHook;