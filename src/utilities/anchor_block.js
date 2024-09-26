import { is_element, is_template } from "@/utilities/utils";

export function anchor_block(el, template, { addScopeToNode, cleanup, initTree, mutateDom, scope = {} }) {
    if (el._r_block) {
        return;
    }

    initialize();

    let nodes = is_template(template)
        ? [...template.content.cloneNode(true).childNodes]
        : [template.cloneNode(true)];

    mutateDom(() => {
        for (let node of nodes) {
            is_element(node) && addScopeToNode(node, scope, el);
            el.parentElement.insertBefore(node, el);
            is_element(node) && initTree(node);
        }
    });

    el._r_block = {
        template,
        update() {
            mutateDom(() => {
                for (let node of nodes ?? []) {
                    el.parentElement.insertBefore(node, el);
                }
            })
        },
        delete() {
            el._r_block = null;
            for (let node of nodes ?? []) {
                node.remove();
            }
            nodes = null;
        }
    }

    cleanup(() => el._r_block?.delete());
}

function initialize() {
    document.body._r_block ??= (() => {
        const observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    node._r_block?.update();
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    })();
}
