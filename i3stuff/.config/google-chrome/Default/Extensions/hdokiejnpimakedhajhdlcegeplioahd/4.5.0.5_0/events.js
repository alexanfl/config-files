"use strict";function onRequest(e){emit(exports,"modify-request",e)}var events=g_system_events,on=g_event_core.on,once=g_event_core.once,off=g_event_core.off,emit=g_event_core.emit;events.on("http-on-modify-request",onRequest),exports.on=on.bind(null,exports),exports.once=once.bind(null,exports),exports.off=off.bind(null,exports);