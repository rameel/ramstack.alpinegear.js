import DOMPurify from "dompurify";
import { is_array, warn } from "@/utilities/utils";

const meta_options_selectors = "meta[name='alpinegear-safehtml-options']";
const data_options_attribute = "data-safehtml-options";

function plugin({ bind, directive, mutateDom: mutate_dom, prefixed }) {
    let global_options;

    directive("safehtml", (el, { expression }, { effect, evaluateLater: evaluate_later }) => {
        global_options ??= parse_options(
            document.querySelector(meta_options_selectors)?.content,
            meta_options_selectors);

        const evaluate = evaluate_later(expression);
        const options = {
            ...global_options,
            ...parse_options(el.getAttribute(data_options_attribute), data_options_attribute),
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            IN_PLACE: false
        };

        effect(() => evaluate(value => {
            const html = DOMPurify.sanitize(value, options);

            mutate_dom(() => {
                el.innerHTML = html;

                const ignore = prefixed("ignore");
                for (let child of el.children) {
                    child.setAttribute(ignore, "");
                    bind(child, { [ignore]: "" });
                }
            });
        }));
    });
}

function parse_options(value, source) {
    if (value) {
        try {
            let options = JSON.parse(value);
            if (options && typeof options === "object" && !is_array(options)) {
                return options;
            }
        }
        catch {
            // Report the same error for malformed JSON and unsupported JSON values
        }
    }

    value && warn(`x-safehtml options in '${source}' must be a valid JSON object`);
    return {};
}

export default plugin;
export {
    plugin as safehtml
}
