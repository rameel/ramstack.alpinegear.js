import { create_history } from "@/plugins/router/history";
import { closest, is_nullish, is_template, listen, warn } from "@/utilities/utils";
import { watch } from "@/utilities/watch";

export default function({ directive, magic, reactive }) {
    directive("router", (el, { expression, value }, { cleanup, evaluate }) => {
        value || (value = "html5");

        const router = closest(el, node => node._r_router)?._r_router;

        if (is_nullish(router) && (value === "outlet" || value === "link")) {
            warn(`no x-router directive found`);
            return;
        }

        switch (value) {
            case "outlet":
                process_outlet();
                break;

            case "link":
                process_link();
                break;

            default:
                process_router();
                break;
        }

        function process_router() {
            if (is_template(el)) {
                warn("x-router cannot be used on a 'template' tag");
                return;
            }

            const values = reactive({
                pattern: "",
                path: "",
                params: ""
            });

            const api = is_nullish(value) && expression
                ? evaluate(expression)
                : create_history(value);

            const router = {
                routes: [],
                outlet: null,
                active: null,
                history: api,
                values: values,
                async match(path) {
                    for (let route of this.routes) {
                        const params = route.match(path);
                        if (params) {
                            const context = { router, route, params, path };
                            if (await route.handler(context) !== false) {
                                return context;
                            }
                        }
                    }
                },
                navigate(path, replace = false) {
                    api.navigate(path, replace);
                    return true;
                }
            };

            el._r_router = router;

            function activate(route, path, params) {
                if (route.nodes?.length && values.path === path) {
                    return;
                }

                clear();

                values.path = path;
                values.pattern = route.template;
                values.params = params;

                router.active = route;

                const outlet = router.outlet;
                if (outlet) {
                    route.view().then(html => {
                        if (values.path !== path
                            || values.pattern !== route.template
                            || JSON.stringify(values.params) !== JSON.stringify(params)) {
                            return;
                        }

                        route.nodes = [...html.cloneNode(true).childNodes];
                        is_template(outlet)
                            ? route.nodes.forEach(node => outlet.parentElement.insertBefore(node, outlet))
                            : route.nodes.forEach(node => outlet.append(node));
                    });
                }
            }

            function clear() {
                if (router.active) {
                    for (let n of router.active.nodes ?? []) {
                        n.remove();
                    }
                    router.active.nodes = null;
                    router.active = null;
                }
            }

            const dispose = watch(() => api.path, async path => {
                const result = await router.match(path);

                if (result) {
                    if (path === api.path) {
                        activate(result.route, result.path, result.params);
                    }
                }
                else {
                    clear();
                }
            });

            cleanup(dispose);
            cleanup(clear);
        }

        function process_link() {
            const is_blank = (el.getAttribute("target") ?? "").indexOf("_blank") >= 0;
            const unsubscribe = listen(el, "click", e => {
                if (e.metaKey
                    || e.altKey
                    || e.ctrlKey
                    || e.shiftKey
                    || e.defaultPrevented
                    || e.button > 0
                    || is_blank) {
                    return;
                }

                e.preventDefault();

                router.navigate(`${ el.pathname }${ el.search }${ el.hash }`);
            });

            cleanup(unsubscribe);
        }

        function process_outlet() {
            router.outlet && warn("x-router:outlet already specified", router.outlet);
            router.outlet || (router.outlet = el);
            cleanup(() => router.outlet = null);
        }
    });

    magic("router", el => closest(el, n => n._r_router)?._r_router);

    magic("active", el => {
        const router = closest(el, node => node._r_router)?._r_router;
        if (is_nullish(router)) {
            warn("No x-router directive found");
            return;
        }

        return router.history.resolve(el.href) === router.values.path;
    });
}
