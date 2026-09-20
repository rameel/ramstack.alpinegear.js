import create_dompurify from "dompurify";
import { parse_options } from "@/utilities/options";

const directive_name = "safehtml";
const meta_options_selectors = "meta[name='alpinegear-safehtml-options']";
const data_options_attribute = "data-safehtml-options";

function plugin({ bind, directive, mutateDom: mutate_dom, prefixed }) {
    const purifier = create_dompurify(window);
    let global_options;

    directive(directive_name, (el, { expression }, { effect, evaluateLater: evaluate_later }) => {
        global_options ??= parse_options(
            document.querySelector(meta_options_selectors)?.content,
            meta_options_selectors,
            directive_name);

        const evaluate = evaluate_later(expression);
        const options = {
            ...global_options,
            ...parse_options(el.getAttribute(data_options_attribute), data_options_attribute, directive_name),
            RETURN_DOM: false,
            RETURN_DOM_FRAGMENT: false,
            IN_PLACE: false
        };

        effect(() => evaluate(value => {
            const html = purifier.sanitize(value, options);

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

export default plugin;
export {
    plugin as safehtml
}
