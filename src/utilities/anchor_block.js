import { is_element, is_template } from "@/utilities/utils";

export function anchor_block(el, template, { addScopeToNode, cleanup, destroyTree, initTree, mutateDom, scope = {} }) {
    if (el._r_block) {
        return;
    }

    initialize();

    let nodes = is_template(template)
        ? [...template.content.cloneNode(true).childNodes]
        : [template.cloneNode(true)];

    // Like x-if, the content is rendered after the template,
    // and the template exposes the last rendered node
    const end = () => nodes.findLast(node => node.parentNode);

    Object.defineProperties(el, {
        // x-for before alpinejs/alpine#4912 moves an x-if item together with
        // its single rendered element and continues after it. Pretending to be x-if
        // makes it move the last node of the block, and the observer brings
        // the rest back. Not needed once the minimum supported Alpine includes the fix.
        _x_currentIfEl: { configurable: true, get: end },

        // x-for with alpinejs/alpine#4912 follows it to move the whole block,
        // morph to skip the content
        _x_lastRenderedEl: { configurable: true, get: end }
    });

    el._r_block = {
        template,
        update() {
            // Do not bring back nodes that were removed rather than moved
            const attached = nodes.filter(node => node.parentNode);

            // While the nodes keep their order, the block is left as is, along with
            // the content rendered between them by a nested x-if, x-for or block
            if (el.parentNode && !in_order(el, attached)) {
                mutateDom(() => {
                    let prev = el;
                    for (let node of attached) {
                        prev.nextSibling === node || prev.after(node);
                        prev = node;
                    }
                });
            }
        },
        delete() {
            // Not in mutateDom: Alpine before 3.14.2 removes nested x-if content
            // and x-for items without destroying them, leaving that to its observer
            el._r_block = null;
            delete el._x_currentIfEl;
            delete el._x_lastRenderedEl;

            for (let node of nodes) {
                node._r_owner = null;
                is_element(node) && destroyTree(node);
                node.remove();
            }

            nodes = null;
        }
    }

    mutateDom(() => {
        for (let node of nodes) {
            node._r_owner = el;
            is_element(node) && addScopeToNode(node, scope, el);
        }

        el.after(...nodes);

        for (let node of nodes) {
            is_element(node) && initTree(node);
        }
    });

    cleanup(() => el._r_block?.delete());
}

// Checks that the nodes follow the anchor in the same parent, in their order
function in_order(anchor, nodes) {
    let prev = anchor;

    for (let node of nodes) {
        if (node.parentNode !== anchor.parentNode
            || !(prev.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)) {
            return false;
        }

        prev = node;
    }

    return true;
}

function initialize() {
    document.body._r_block ??= (() => {
        const observer = new MutationObserver(mutations => {
            const anchors = new Set();

            // x-for moves the template and the last node of a block, and may swap
            // its other nodes with the ones of other items. Only the nodes of the block
            // itself are restored: like Alpine with nested templates in x-for items
            // (alpinejs/alpine#4911), the content rendered for a nested x-if, x-for
            // or block at the top level of the block is not kept in order.
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    anchors.add(node._r_block ? node : node._r_owner);
                }
            }

            for (let anchor of anchors) {
                anchor?._r_block?.update();
            }

            // Restoring only puts the existing nodes back in place,
            // so the records it produces need no further handling
            observer.takeRecords();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    })();
}
