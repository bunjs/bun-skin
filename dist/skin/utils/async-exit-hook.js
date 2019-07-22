const noop = function () { };
const defaultOptions = {
    onExitDone: noop,
    onExit: noop,
    asyncTimeoutMs: 10000
};
class ExitHook {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
        this.hooks = [];
        this.called = false;
        this.waitingFor = 0;
        this.events = Object.create(null);
        this.filters = Object.create(null);
        this.unhandledRejectionHooks = [];
        this.uncaughtExceptionHooks = [];
        this.addHook(this.options.onExit);
    }
    addHook(exitFunc) {
        this.add(exitFunc);
        this.unhandledRejectionHandler(exitFunc);
        this.uncaughtExceptionHandler(exitFunc);
    }
    add(hook) {
        this.hooks.push(hook);
        if (this.hooks.length === 1) {
            this.hookEvent('exit');
            this.hookEvent('beforeExit', 0);
            this.hookEvent('SIGHUP', 128 + 1);
            this.hookEvent('SIGINT', 0);
            this.hookEvent('SIGTERM', 128 + 15);
            this.hookEvent('SIGBREAK', 128 + 21);
            this.hookEvent('message', 0, function (msg) {
                if (msg !== 'shutdown') {
                    return true;
                }
            });
        }
    }
    unhandledRejectionHandler(hook) {
        this.unhandledRejectionHooks.push(hook);
        if (this.unhandledRejectionHooks.length === 1) {
            this.events.unhandledRejection = this.exit.bind(this, true, 'unhandledRejection', 1);
            process.once('unhandledRejection', this.events.unhandledRejection);
        }
    }
    uncaughtExceptionHandler(hook) {
        this.uncaughtExceptionHooks.push(hook);
        if (this.uncaughtExceptionHooks.length === 1) {
            this.events.uncaughtException = this.exit.bind(this, true, 'uncaughtException', 1);
            process.once('uncaughtException', this.events.uncaughtException);
        }
    }
    hookEvent(event, code, filter) {
        const _this = this;
        this.events[event] = function () {
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
    unhookEvent(event) {
        process.removeListener(event, this.events[event]);
        delete this.events[event];
        delete this.filters[event];
    }
    unhookAllEvent() {
        Object.keys(this.events).forEach((event) => {
            this.unhookEvent(event);
        });
    }
    exit(exit, type, code, err) {
        const _this = this;
        let doExitDone = false;
        function doExit() {
            if (doExitDone) {
                return;
            }
            doExitDone = true;
            if (exit === true) {
                process.nextTick(() => {
                    if (_this.options.onExitDone) {
                        _this.options.onExitDone(code);
                    }
                    process.exit.call(null, code);
                });
            }
        }
        function stepTowardExit() {
            process.nextTick(() => {
                if (--_this.waitingFor === 0) {
                    doExit();
                }
            });
        }
        function runHook(syncArgCount, err, hook) {
            if (exit && hook.length > syncArgCount) {
                _this.waitingFor++;
                return hook(err, stepTowardExit);
            }
            if (err) {
                return hook(err, noop);
            }
            return hook(null, noop);
        }
        if (_this.called) {
            return;
        }
        _this.called = true;
        if (err) {
            if (type === 'uncaughtException') {
                _this.uncaughtExceptionHooks.map(runHook.bind(null, 1, err));
            }
            else if (type === 'unhandledRejection') {
                _this.unhandledRejectionHooks.map(runHook.bind(null, 1, err));
            }
        }
        else {
            _this.hooks.map(runHook.bind(null, 1, null));
        }
        if (_this.waitingFor) {
            setTimeout(() => {
                doExit();
            }, _this.options.asyncTimeoutMs);
        }
        else {
            doExit();
        }
    }
}
module.exports = ExitHook;
//# sourceMappingURL=async-exit-hook.js.map