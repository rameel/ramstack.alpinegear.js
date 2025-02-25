import { RoutePattern } from "@/plugins/router/RoutePattern";
import { load_template } from "@/utilities/load_template";
import {
    asyncify,
    closest,
    is_nullish,
    is_template,
    warn
} from "@/utilities/utils";

export default function({ directive, magic, $data }) {
    directive("route", (el, { expression, value, modifiers }, { cleanup, evaluate }) => {
        if (!is_template(el)) {
            warn("x-route can only be used on a 'template' tag");
            return;
        }

        const route = closest(el, n => n._b_route)?._b_route;

        if (is_nullish(route) && (value === "view" || value === "handler")) {
            warn(`no x-route directive found`);
            return;
        }

        switch (value) {
            case "view":
                process_view();
                break;

            case "handler":
                process_handler();
                break;

            default:
                process_route();
                break;
        }

        function process_route() {
            const router = closest(el, n => n._b_router)?._b_router;
            if (is_nullish(router)) {
                warn(`no x-router directive found`);
                return;
            }

            const view = () => new Promise(resolve => resolve(el.content));

            el._b_route = Object.assign(new RoutePattern(expression), { el, view, handler: () => Promise.resolve() });
            router.routes.push(el._b_route);

            cleanup(() => {
                router.routes = router.routes.filter(r => r !== el._b_route);
            });
        }

        function process_handler() {
            expression || (expression = "[]");
            expression.startsWith("[") || (expression = `[${ expression }]`);

            const handlers = evaluate(expression).map(asyncify);
            const self = $data(el);

            route.handler = async context => {
                for (let handler of handlers) {
                    const r = await handler.call(self, context);
                    if (!is_nullish(r)) {
                        return r;
                    }
                }
            };

            cleanup(() => route.handler = null);
        }

        function process_view() {
            route.view = () => load_template(expression);

            cleanup(() => {
                route.view = () => new Promise(resolve => resolve(new DocumentFragment()));
            });
        }
    });

    magic("route", el => closest(el, n => n._b_router)?._b_router.values);
}
