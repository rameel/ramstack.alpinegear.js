const key = Symbol();
let observer;

export function observe_resize(el, listener) {
    observer ??= new ResizeObserver(entries => {
        for (const e of entries) {
            for (const callback of e.target[key]?.values() ?? []) {
                callback(e);
            }
        }
    });

    el[key] ??= new Set();
    el[key].add(listener);

    observer.observe(el);

    return () => {
        el[key].delete(listener);

        if (!el[key].size) {
            observer.unobserve(el);
            el[key] = null;
        }
    };
}
