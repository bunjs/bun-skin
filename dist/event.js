"use strict";

/**
 * @class Events
 * 主要用来做生命周期监听
 * 自定义事件注册器
 */
const EventEmitter = require('events');

class Events extends EventEmitter {}

const emitter = new Events(); // 增加limit 上限,暂定 100

emitter.setMaxListeners(100);
module.exports = emitter;