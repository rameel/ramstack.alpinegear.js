export const warn = (...args) => console.warn("alpine-gear.js:", ...args);
export const is_array = Array.isArray;
export const is_nullish = value => value === null || value === undefined;
export const is_checkable_input = el => el.type === "checkbox" || el.type === "radio";
export const is_numeric_input = el => el.type === "number" || el.type === "range";
export const is_template = el => el instanceof HTMLTemplateElement;
export const is_element = el => el.nodeType === Node.ELEMENT_NODE;
export const is_function = value => typeof value === "function";
export const as_array = value => is_array(value) ? value : [value];
export const loose_equal = (a, b) => a == b;
export const loose_index_of = (array, value) => array.findIndex(v => v == value);
export const has_modifier = (modifiers, modifier) => modifiers.includes(modifier);

export function assert(value, message) {
    if (__DEV && !value) {
        throw new Error(message || "Assertion failed.");
    }
}

export const asyncify = fn => {
    if (is_function(fn) && fn.constructor?.name === "AsyncFunction") {
        return fn;
    }

    return function(...args) {
        const result = fn.apply(this, args);
        return is_function(result?.then) ? result : Promise.resolve(result);
    }
}

export const listen = (target, type, listener, options) => {
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
}

export const single = (...fns) => (...args) => {
    for (const fn of fns) {
        fn && fn(...args);
    }
};

export const clone = value =>
    typeof value === "object"
        ? JSON.parse(JSON.stringify(value))
        : value

export const closest = (el, callback) => {
    while (el && !callback(el)) {
        el = (el._x_teleportBack ?? el).parentElement;
    }

    return el;
}

export const create_map = keys => new Map(
    keys.split(",").map(v => [v.trim().toLowerCase(), v.trim()]));
