import DOMPurify from "dompurify";

function plugin({ directive, initTree: init_tree, mutateDom: mutate_dom }) {
    directive("safehtml", (el, { expression }, { effect, evaluateLater: evaluate_later }) => {
        const evaluate = evaluate_later(expression);

        effect(() => evaluate(value => {
            const html = DOMPurify.sanitize(value);

            mutate_dom(() => {
                el.innerHTML = html;
                el._x_ignoreSelf = true;
                init_tree(el);
                delete el._x_ignoreSelf;
            });
        }));
    });
}

export default plugin;
export {
    plugin as safehtml
}
