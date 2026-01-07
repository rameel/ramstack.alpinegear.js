import { create_getter } from "@/utilities/evaluator";
import { has_modifier } from "@/utilities/utils";

function plugin({ directive, evaluateLater, mutateDom }) {
    directive("format", (el, { modifiers }, { effect }) => {
        const placeholder_regex = /{{(?<expr>.+?)}}/g;
        const is_once = has_modifier(modifiers, "once");
        const has_format_attr = el => el.hasAttribute("x-format");

        process(el);

        function update(callback) {
            if (is_once) {
                mutateDom(() => callback());
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
                    if (node !== el) {
                        //
                        // When we encounter an element with the "x-data" attribute, its properties
                        // are not yet initialized, and the Alpine context is unavailable.
                        // Attempting to use these properties will result in
                        // an "Alpine Expression Error: [expression] is not defined".
                        //
                        // Workaround:
                        // To avoid this, we manually add our "x-format" directive to the element.
                        // Alpine evaluates "x-format" directive once the context is initialized.
                        // In the current loop, we skip these elements to defer their processing.
                        //
                        // This also handles cases where the user manually adds the "x-format" attribute.
                        //
                        if (node.hasAttribute("x-data") && !has_format_attr(node)) {
                            node.setAttribute("x-format", "");
                        }

                        if (has_format_attr(node)) {
                            break;
                        }
                    }

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
                        const get_value = create_getter(evaluateLater, node.parentNode, tokens[i]);
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
                    update(() => attr.value = template.replace(placeholder_regex, (_, expr) => create_getter(evaluateLater, node, expr)()));
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
