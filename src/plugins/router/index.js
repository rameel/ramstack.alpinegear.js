import route from "@/plugins/router/route";
import router from "@/plugins/router/router";
import {
    RoutePattern
} from "@/plugins/router/RoutePattern";

function plugin(alpine) {
    window.RoutePattern = RoutePattern;
    alpine.plugin([router, route]);
}

export default plugin;
export {
    plugin as router,
    RoutePattern
}
