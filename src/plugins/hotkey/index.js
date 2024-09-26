import { registerHotkey as register_hotkey } from "@ramstack/hotkey";
import { single, has_modifier } from "@/utilities/utils";

const option_keys = ["capture", "passive", "once", "prevent", "stop", "window", "document"];

function plugin({ directive }) {
    directive("hotkey", (el, { expression, value, modifiers }, { evaluateLater, cleanup }) => {
        const listener = e => evaluate(() => { }, { scope: { $event: e }, params: [e] });

        const evaluate = expression
            ? evaluateLater(expression)
            : () => {};

        const target =
            has_modifier(modifiers, "window")
                ? window
                : has_modifier(modifiers, "document")
                    ? document
                    : el;

        const disposes = modifiers
            .filter(m => !option_keys.includes(m))
            .flatMap(s => s.split(","))
            .map(hotkey => register_hotkey(
                target,
                hotkey,
                e => {
                    has_modifier(modifiers, "prevent") && e.preventDefault();
                    has_modifier(modifiers, "stop") && e.stopPropogation();

                    e.hotkey = hotkey;
                    listener(e);
                },
                value || "keydown",
                {
                    capture: has_modifier(modifiers, "capture"),
                    passive: has_modifier(modifiers, "passive"),
                    once: has_modifier(modifiers, "once")
                }));

        cleanup(single(...disposes));
    });
}

export default plugin;
export {
    plugin as hotkey
}
