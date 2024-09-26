import { create_getter, create_setter } from "@/utilities/evaluator";
import { observe_resize } from "@/utilities/observe_resize";
import { watch } from "@/utilities/watch";
import {
    as_array,
    clone,
    closest,
    create_map,
    has_modifier,
    is_array,
    is_checkable_input,
    is_nullish,
    is_numeric_input,
    listen,
    loose_equal,
    loose_index_of,
    warn
} from "@/utilities/utils";

const canonical_names = create_map(
    "value,checked,files," +
    "innerHTML,innerText,textContent," +
    "videoHeight,videoWidth," +
    "naturalHeight,naturalWidth," +
    "clientHeight,clientWidth,offsetHeight,offsetWidth," +
    "open," +
    "group");

function plugin({ directive, entangle, evaluateLater, mapAttributes, mutateDom, prefixed }) {
    // creating a shortcut for the directive,
    // when an attribute name starting with & will refer to our directive,
    // allowing us to write like this: &value="prop",
    // which is equivalent to x-bound:value="prop"
    mapAttributes(attr => ({
        name: attr.name.replace(/^&/, prefixed("bound:")),
        value: attr.value
    }));

    directive("bound", (el, { expression, value, modifiers }, { effect, cleanup }) => {
        if (!value) {
            warn("x-bound directive expects the presence of a bound property name.");
            return;
        }

        const tag_name = el.tagName.toUpperCase();

        expression = expression?.trim();

        // since attributes come in a lowercase,
        // we need to convert the bound property name to its canonical form
        const property_name = canonical_names.get(value.trim().replace("-", "").toLowerCase());

        // if the expression is omitted, then we assume it corresponds
        // to the bound property name, allowing us to write expressions more concisely,
        // and write &value instead of &value="value"
        expression ||= property_name;

        const get_value = create_getter(evaluateLater, el, expression);
        const set_value = create_setter(evaluateLater, el, expression);

        const update_property = () => loose_equal(el[property_name],  get_value()) || mutateDom(() => el[property_name] = get_value());
        const update_variable = () => set_value(is_numeric_input(el) ? to_number(el[property_name]) : el[property_name]);

        let processed;

        switch (property_name) {
            case "value":
                process_value();
                break;

            case "checked":
                process_checked();
                break;

            case "files":
                process_files();
                break;

            case "innerHTML":
            case "innerText":
            case "textContent":
                process_contenteditable();
                break;

            case "videoHeight":
            case "videoWidth":
                process_media_resize("VIDEO", "resize");
                break;

            case "naturalHeight":
            case "naturalWidth":
                process_media_resize("IMG", "load");
                break;

            case "clientHeight":
            case "clientWidth":
            case "offsetHeight":
            case "offsetWidth":
                process_dimensions();
                break;

            case "open":
                process_details();
                break;

            case "group":
                process_group();
                break;
        }

        if (!processed) {
            const modifier =
                has_modifier(modifiers, "in")  ? "in"  :
                has_modifier(modifiers, "out") ? "out" : "inout";

            const source_el = expression === value
                ? closest(el.parentNode, node => node._x_dataStack)
                : el;

            if (!el._x_dataStack) {
                warn("x-bound directive requires the presence of the x-data directive to bind component properties.");
                return;
            }

            if (!source_el) {
                warn(`x-bound directive cannot find the parent scope where the '${ value }' property is defined.`);
                return;
            }

            const source = {
                get: create_getter(evaluateLater, source_el, expression),
                set: create_setter(evaluateLater, source_el, expression),
            };

            const target = {
                get: create_getter(evaluateLater, el, value),
                set: create_setter(evaluateLater, el, value),
            };

            switch (modifier) {
                case "in":
                    cleanup(watch(() => source.get(), v => target.set(clone(v))));
                    break;
                case "out":
                    cleanup(watch(() => target.get(), v => source.set(clone(v))));
                    break;
                default:
                    cleanup(entangle(source, target));
                    break;
            }
        }

        function process_value() {
            switch (tag_name) {
                case "INPUT":
                case "TEXTAREA":
                    // if the value of the bound property is "null" or "undefined",
                    // we initialize it with the value from the element.
                    is_nullish(get_value()) && update_variable();

                    effect(update_property);
                    cleanup(listen(el, "input", update_variable));

                    processed = true;
                    break;

                case "SELECT":
                    // WORKAROUND:
                    // For the "select" element, there might be a situation
                    // where options are generated dynamically using the "x-for" directive,
                    // and in this case, attempting to set the "value" property
                    // will have no effect since there are no options yet.
                    // Therefore, we use a small trick to set the value a bit later
                    // when the "x-for" directive has finished its work.
                    queueMicrotask(() => {
                        // if the value of the bound property is "null" or "undefined",
                        // we initialize it with the value from the element.
                        is_nullish(get_value()) && update_variable();

                        effect(() => apply_select_values(el, as_array(get_value() ?? [])));
                        cleanup(listen(el, "change", () => set_value(collect_selected_values(el))));
                    });

                    processed = true;
                    break;
            }
        }

        function process_checked() {
            if (is_checkable_input(el)) {
                effect(update_property);
                cleanup(listen(el, "change", update_variable));
                processed = true;
            }
        }

        function process_files() {
            if (el.type === "file") {
                cleanup(listen(el, "input", update_variable));
                processed = true;
            }
        }

        function process_contenteditable() {
            if (el.contentEditable === "true") {
                is_nullish(get_value()) && update_variable();

                effect(update_property);
                cleanup(listen(el, "input", update_variable));
                processed = true;
            }
        }

        function process_media_resize(name, event_name) {
            if (tag_name === name) {
                update_variable();
                cleanup(listen(el, event_name, update_variable));
                processed = true;
            }
        }

        function process_dimensions() {
            cleanup(observe_resize(el, update_variable));
            processed = true;
        }

        function process_details() {
            if (tag_name === "DETAILS") {
                // if the value of the bound property is "null" or "undefined",
                // we initialize it with the value from the element.
                is_nullish(get_value()) && update_variable();

                effect(update_property);
                cleanup(listen(el, "toggle", update_variable));
                processed = true;
            }
        }

        function process_group() {
            if (is_checkable_input(el)) {
                el.name || mutateDom(() => el.name = expression);

                effect(() =>
                    mutateDom(() =>
                        apply_group_values(el, get_value() ?? [])));

                cleanup(listen(el, "input", () => set_value(collect_group_values(el, get_value()))));
                processed = true;
            }
        }
    });
}

function to_number(value) {
    return value === "" ? null : +value;
}

function apply_select_values(el, values) {
    for (const option of el.options) {
        option.selected = loose_index_of(values, option.value) >= 0;
    }
}

function collect_selected_values(el) {
    if (el.multiple) {
        return [...el.selectedOptions].map(o => o.value);
    }

    return el.value;
}

function apply_group_values(el, values) {
    el.checked = is_array(values)
        ? loose_index_of(values, el.value) >= 0
        : loose_equal(el.value, values);
}

function collect_group_values(el, values) {
    if (el.type === "radio") {
        return el.value;
    }

    values = as_array(values);
    const index = loose_index_of(values, el.value);

    if (el.checked) {
        index >= 0 || values.push(el.value);
    }
    else {
        index >= 0 && values.splice(index, 1);
    }

    return values;
}

export default plugin;
export {
    plugin as bound
}
