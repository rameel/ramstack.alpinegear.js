import { listen } from "@/utilities/utils";

const matches = (el, selector) => el.matches(selector);

const is_active_element_editable = () => {
    const el = document.activeElement;
    if (el === document.body || !el) {
        return false;
    }

    return matches(el, "input")
        || matches(el, "textarea")
        || el.isContentEditable;
}

const is_printable_key_pressed = ({ key, metaKey, ctrlKey, altKey }) =>
    !metaKey && !ctrlKey && !altKey && /^[^\p{M}\p{Z}\p{C}]$/u.test(key);

function plugin({ directive }) {
    directive("typegrab", (el, _, { cleanup }) => {
        cleanup(
            listen(document, "keydown", e => {
                if (!is_active_element_editable() && is_printable_key_pressed(e)) {
                    el.focus();
                }
            }, { passive: true })
        );
    });
}

export default plugin;
export {
    plugin as typegrab
}
