export function create_getter(evaluate_later, ...args) {
    const evaluate = evaluate_later(...args);
    return () => {
        let result;
        evaluate(v => result = v);
        return has_getter(result) ? result.get() : result;
    };
}

export function create_setter(evaluate_later, ...args) {
    const evaluate = evaluate_later(...args);
    args[args.length - 1] = `${ args.at(-1) } = __val`;
    const set = evaluate_later(...args);

    return value => {
        let result;
        evaluate(v => result = v);

        if (has_setter(result)) {
            result.set(value);
        }
        else {
            set(() => { }, {
                scope: {
                    __val: value
                }
            });
        }
    };
}

function has_getter(value) {
    return typeof value?.get === "function";
}

function has_setter(value) {
    return typeof value?.set === "function";
}
