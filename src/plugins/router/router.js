import { create_history } from "@/plugins/router/history";
import { closest, is_nullish, is_template, listen, warn } from "@/utilities/utils";
import { watch } from "@/utilities/watch";

export default function({ $data, addScopeToNode, directive, magic, reactive }) {
    directive("router", (el, { value }, { cleanup }) => {
        value || (value = "html5");

        const router = $data(el).$router;

        if (!router && (value === "outlet" || value === "link")) {
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
                params: {}
            });

            const api = create_history(value);

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

            addScopeToNode(el, { $route: values, $router: router });

            function activate(route, path, params) {
                if (route.nodes?.length && values.path === path) {
                    return;
                }

                clear();

                values.path = path;
                values.pattern = route.template;
                values.params = params ?? {};

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
            let link = get_anchor_element(el);
            if (link) {
                el._r_routerlink = link;

                const is_blank = (link.getAttribute("target") ?? "").indexOf("_blank") >= 0;
                const unsubscribe = listen(link, "click", e => {
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

                    router.navigate(`${ link.pathname }${ link.search }${ link.hash }`);
                });

                cleanup(unsubscribe);
            }

            //
            // A warning about a non-existing anchor element is printed in the get_anchor_element function.
            // warn("<a> element not found")
            //
        }

        function process_outlet() {
            if (router.outlet) {
                warn("x-router:outlet already specified", router.outlet, el);
            }
            else {
                router.outlet = el;
                cleanup(() => router.outlet = null);
            }
        }
    });

    magic("active", el => {
        const router = $data(el).$router;
        if (is_nullish(router)) {
            warn("No x-router directive found");
            return false;
        }

        //
        // Create a dependency on router.values
        //
        JSON.stringify(router.values);

        const link = is_anchor_element(el) ? el : closest(el, node => node._r_routerlink)?._r_routerlink;

        //
        // The issue is that the router:link directive is processed later than x-bind,
        // and if $active is used in x-bind, we won’t find node._r_routerlink.
        // Therefore, we delay execution and try again.
        //
        // <div x-router:link :class="{ active: $active }">
        //    ...
        // </div>
        //

        if (link) {
            return router.history.resolve(link.href) === router.values.path;
        }

        if (el._r_routerlink_init) {
            warn(`x-router:link directive not found`, el);
        }
        else {
            queueMicrotask(() => {
                el._r_routerlink_init = true;
                //
                // Force an upate
                //
                router.values.path = router.values.path;
            });
        }

        return false;
    });
}

function is_anchor_element(el) {
    return el.tagName.toUpperCase() === "A";
}

function get_anchor_element(el) {
    if (is_anchor_element(el)) {
        return el;
    }

    const links = el.querySelectorAll("a");
    links.length !== 1 && warn(`Expected exactly one link, but found ${links.length}`);
    return links[0];
}
