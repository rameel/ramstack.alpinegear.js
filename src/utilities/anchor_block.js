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
    const end = () => {
        let node = nodes.findLast(node => node.parentNode);
        return node && last_node(node);
    };

    Object.defineProperties(el, {
        // x-for before alpinejs/alpine#4912 handles x-if items specially: it keeps
        // the x-if content right after the item and continues after it. Pretending
        // to be x-if makes it treat the whole block as the item, so the last item
        // it reports in 3.16+ is the actual end of the list. Not needed once
        // the minimum supported Alpine includes the fix.
        _x_currentIfEl: { configurable: true, get: end },

        // x-for with alpinejs/alpine#4912 follows it to move the whole block,
        // morph to skip the content
        _x_lastRenderedEl: { configurable: true, get: end }
    });

    el._r_block = {
        template,
        update() {
            let last = el;
            el.parentNode && mutateDom(() => {
                for (let node of nodes) {
                    // Do not bring back nodes that were removed rather than moved
                    if (node.parentNode) {
                        last = restore(node, skip_rendered(last, el));
                    }
                }
            });
            return last;
        },
        delete() {
            mutateDom(() => {
                el._r_block = null;
                delete el._x_currentIfEl;
                delete el._x_lastRenderedEl;

                for (let node of nodes) {
                    node._r_anchor = null;
                    is_element(node) && destroyTree(node);
                    node.remove();
                }

                nodes = null;
            });
        }
    }

    mutateDom(() => {
        for (let node of nodes) {
            // Set before initTree, so the observer can tell the nodes of nested blocks apart
            node._r_anchor = el;
            is_element(node) && addScopeToNode(node, scope, el);
        }

        el.after(...nodes);

        for (let node of nodes) {
            is_element(node) && initTree(node);
        }
    });

    cleanup(() => el._r_block?.delete());
}

// Places the node right after "prev", followed by the content rendered for it
// by a nested block or x-if, and returns the last placed node
function restore(node, prev) {
    prev.nextSibling === node || prev.after(node);

    return node._r_block
        ? node._r_block.update()
        : node._x_currentIfEl
            ? restore(node._x_currentIfEl, node)
            : node;
}

// x-for renders its items after its template and keeps them in order itself,
// so step over them up to the next node owned by the block
function skip_rendered(node, anchor) {
    if (node._x_lookup) {
        // Alpine below 3.16 does not expose the last item
        const end = last_node(node);
        const known = end !== node;

        while (node.nextSibling && node.nextSibling._r_anchor !== anchor && !(known && node === end)) {
            node = node.nextSibling;
        }
    }

    return node;
}

// Follows nested x-if, x-for and blocks to the last node rendered for the node
function last_node(node) {
    while (true) {
        const next = node._x_currentIfEl ?? node._x_lastRenderedEl;

        // Rendered content stays next to its template, so a detached
        // or moved away node is no longer part of it
        if (!next || next.parentNode !== node.parentNode) {
            return node;
        }

        node = next;
    }
}

function initialize() {
    document.body._r_block ??= (() => {
        const observer = new MutationObserver(mutations => {
            const parents = new Set();

            // Deleting a block can remove nested ones, so the records it produces are processed too
            for (; mutations.length; mutations = observer.takeRecords()) {
                for (let mutation of mutations) {
                    for (let list of [mutation.addedNodes, mutation.removedNodes]) {
                        for (let node of list) {
                            (node._r_block || node._r_anchor) && parents.add(mutation.target);
                        }
                    }

                    for (let node of mutation.removedNodes) {
                        // Alpine before 3.14.2 removes x-if content without destroying it
                        // while its observer is paused, so the block would be left behind
                        node.isConnected || node._r_block?.delete();
                    }
                }
            }

            // Moving one item, x-for may also move separate nodes of other blocks
            // or insert the next item into the middle of a block. Rather than tracking
            // the affected blocks, restore each block of the parent after its template,
            // since x-for keeps the templates themselves in order. Nested blocks are
            // restored by their parents.
            for (let parent of parents) {
                for (let node of [...parent.childNodes]) {
                    node._r_anchor || node._r_block?.update();
                }
            }

            // Restoring only moves the nodes of the blocks themselves,
            // so the records it produces need no further handling
            observer.takeRecords();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    })();
}
