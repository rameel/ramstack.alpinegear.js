const key = Symbol();
let observable;

export function observe_resize(el, listener) {
    observable ??= new ResizeObserver(entries => {
        for (const e of entries) {
            for (const callback of e.target[key]?.values() ?? []) {
                callback(e);
            }
        }
    });

    el[key] ??= new Set();
    el[key].add(listener);

    observable.observe(el);

    return () => {
        el[key].delete(listener);

        if (!el[key].size) {
            observable.unobserve(el);
            el[key] = null;
        }
    };
}
