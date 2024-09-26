import { create_getter } from "@/utilities/evaluator";
import { is_nullish, has_modifier } from "@/utilities/utils";

function plugin({ directive, mutateDom }) {
    directive("format", (el, { modifiers }, { effect, evaluateLater }) => {
        const cache = new Map;
        const placeholder_regex = /{{(?<expr>.+?)}}/g;
        const is_once = has_modifier(modifiers, "once");

        process(el);

        function get_eval_fn(expression) {
            let getter = cache.get(expression);
            if (is_nullish(getter)) {
                getter = create_getter(evaluateLater, expression);
                cache.set(expression, getter);
            }

            return getter;
        }

        function update(callback) {
            if (is_once) {
                mutateDom(() => callback());
                cache.clear();
            }
            else {
                effect(() => mutateDom(() => callback()));
            }
        }

        function process(node) {
            switch (node.nodeType) {
                case Node.TEXT_NODE:
                    process_text_node(node);
                    break;

                case Node.ELEMENT_NODE:
                    process_nodes(node);
                    process_attributes(node);
                    break;
            }
        }

        function process_text_node(node) {
            const tokens = node.textContent.split(placeholder_regex);

            if (tokens.length > 1) {
                const fragment = new DocumentFragment();

                for (let i = 0; i < tokens.length; i++) {
                    if ((i % 2) === 0) {
                        fragment.appendChild(document.createTextNode(tokens[i]));
                    }
                    else {
                        const get_value = get_eval_fn(tokens[i]);
                        const text = document.createTextNode("");

                        fragment.append(text);
                        update(() => text.textContent = get_value());
                    }
                }

                mutateDom(() =>
                    node.parentElement.replaceChild(fragment, node));
            }
        }

        function process_attributes(node) {
            for (let attr of node.attributes) {
                const matches = [...attr.value.matchAll(placeholder_regex)];
                if (matches.length) {
                    const template = attr.value;
                    update(() => attr.value = template.replace(placeholder_regex, (_, expr) => get_eval_fn(expr)()));
                }
            }
        }

        function process_nodes(node) {
            for (let child of node.childNodes) {
                process(child);
            }
        }
    });
}

export default plugin;
export {
    plugin as format
}
