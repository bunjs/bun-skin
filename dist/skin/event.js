"use strict";
const EventEmitter = require("events");
class Events extends EventEmitter {
}
const emitter = new Events();
emitter.setMaxListeners(100);
module.exports = emitter;
//# sourceMappingURL=event.js.map