import route from "@/plugins/router/route";
import router from "@/plugins/router/router";
import {
    RoutePattern
} from "@/plugins/router/RoutePattern";

// the CDN (IIFE) build has no module exports,
// so the class is made available globally there
if (__IIFE__) {
    window.RoutePattern = RoutePattern;
}

function plugin(alpine) {
    alpine.plugin([router, route]);
}

export default plugin;
export {
    plugin as router,
    RoutePattern
}
