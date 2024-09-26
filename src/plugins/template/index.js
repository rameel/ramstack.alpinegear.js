import { is_template, warn } from "@/utilities/utils";

function plugin(alpine) {
    alpine.directive("template", (el, { expression }) => {
        if (is_template(el)) {
            warn("x-template cannot be used on a 'template' tag.");
            return;
        }

        const tpl = document.getElementById(expression);

        if (!is_template(tpl)) {
            warn("x-template directive can only reference the template tag.");
            return;
        }

        // Adding a queued task ensures asynchronous content update, allowing Alpine.js
        // to handle context propagation for cloned elements properly.
        // This is important because manipulation can occur within the mutateDom function
        // when mutation observing is disabled, preventing proper context propagation
        // for cloned elements
        queueMicrotask(() => {
            el.innerHTML = "";
            el.append(tpl.content.cloneNode(true));
        });
    });
}

export default plugin;
export {
    plugin as template
}
