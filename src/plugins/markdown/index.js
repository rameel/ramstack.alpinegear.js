import { renderHtml as render_html } from "@tanstack/markdown/html";
import { parse_options } from "@/utilities/options";
import { has_modifier, is_template, warn } from "@/utilities/utils";

const directive_name = "markdown";
const meta_options_selectors = "meta[name='alpinegear-markdown-options']";
const data_options_attribute = "data-markdown-options";
const content_modifiers = ["content", "static"];
const supported_options = [
    "allowHtml",
    "codeLineNumbers",
    "frontmatter",
    "headingAnchors",
    "headingIds"
];

function plugin({ bind, directive, mutateDom: mutate_dom, prefixed }) {
    let global_options;

    directive(directive_name, (el, { expression, modifiers }, { effect, evaluateLater: evaluate_later }) => {
        if (is_template(el)) {
            warn("x-markdown cannot be used on a 'template' tag");
            return;
        }

        const has_content_modifier = content_modifiers.some(mod => has_modifier(modifiers, mod));

        if (expression && has_content_modifier) {
            warn("x-markdown cannot combine an expression with the '.content' or '.static' modifier");
            return;
        }

        if (!expression && !has_content_modifier) {
            warn("x-markdown requires an expression or the '.content' or '.static' modifier");
            return;
        }

        global_options ??= pick_options(parse_options(
            document.querySelector(meta_options_selectors)?.content,
            meta_options_selectors,
            directive_name));

        const options = {
            ...global_options,
            ...pick_options(parse_options(
                el.getAttribute(data_options_attribute),
                data_options_attribute,
                directive_name))
        };

        const render = value => {
            const html = render_html(strip_indent(value), options);

            mutate_dom(() => {
                el.innerHTML = html;

                const ignore = prefixed("ignore");
                for (let child of el.children) {
                    child.setAttribute(ignore, "");
                    bind(child, { [ignore]: "" });
                }
            });
        };

        if (expression) {
            const evaluate = evaluate_later(expression);
            effect(() => evaluate(value => render(String(value ?? ""))));
        }
        else {
            render(el.textContent);
        }
    });
}

function pick_options(options) {
    return Object.fromEntries(
        supported_options
            .filter(k => k in options)
            .map(k => [k, options[k]])
    );
}

function strip_indent(text) {
    let indent = min_indent(text);
    if (indent) {
        const regex = new RegExp(`^[ \\t\\r\\f\\v]{${indent}}`, "gm");
        text = text.replace(regex, "");
    }

    return text.trim();
}

function min_indent(v) {
    return v.match(/^[ \t\r\f\v]*(?=\S)/gm)?.reduce((r, s) => Math.min(r, s.length), Number.MAX_SAFE_INTEGER) ?? 0;
}

export default plugin;
export {
    plugin as markdown
}
