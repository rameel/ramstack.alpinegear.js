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
                        last = restore(node, last);
                    }
                }
            });
            return last;
        },
        delete() {
            // Not in mutateDom: Alpine before 3.14.2 removes nested x-if content
            // and x-for items without destroying them, leaving that to its observer
            el._r_block = null;
            delete el._x_currentIfEl;
            delete el._x_lastRenderedEl;

            for (let node of nodes) {
                node._r_anchor = null;
                is_element(node) && destroyTree(node);
                node.remove();
            }

            nodes = null;
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
// by a nested block, x-if or x-for, and returns the last placed node
function restore(node, prev) {
    prev.nextSibling === node || prev.after(node);

    if (node._r_block) {
        return node._r_block.update();
    }

    if (node._x_currentIfEl) {
        return restore(node._x_currentIfEl, node);
    }

    let last = node;

    if (node._x_lookup) {
        for (let item of x_for_items(node)) {
            last = restore(item, last);
        }
    }

    return last;
}

// Returns the items rendered by x-for in their order. "inserted" maps the items
// added since the last call to the node each one was first inserted after.
function x_for_items(node, inserted) {
    const lookup = node._x_lookup;

    // Alpine before 3.15 keeps the keys in order
    if (!(lookup instanceof Map)) {
        return node._x_prevKeys.map(key => lookup[key]);
    }

    // Alpine 3.15+ creates the lookup on each run, with the items it already had
    // in order, followed by the added ones. Their order in the DOM can be broken
    // by the outer x-for, or by another nested one moving its own scattered items,
    // so each added item is placed after the node x-for inserted it after: the template,
    // the previous item or its content.
    if (node._r_lookup !== lookup) {
        const known = new Set(node._r_items);
        const items = [...lookup.values()];
        const next = new Map();

        for (let item of items) {
            known.has(item) || !inserted?.has(item) || next.set(inserted.get(item), item);
        }

        let order = items;

        if (next.size) {
            order = [];
            const follow = prev => {
                for (let item; (item = next.get(prev)); prev = item) {
                    order.push(item);
                }
            };

            follow(node);
            for (let item of items) {
                if (known.has(item)) {
                    order.push(item);
                    follow(item);
                    item._x_currentIfEl && follow(item._x_currentIfEl);
                }
            }

            // Not expected, but the items with an unknown position must not get lost
            const placed = new Set(order);
            order.push(...items.filter(item => !placed.has(item)));
        }

        node._r_lookup = lookup;
        node._r_items = order;
    }

    return node._r_items;
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

// Alpine 3.15+ x-for puts each item after the previous one, swapping it with the node
// found there. Run in the same tick after the outer x-for, which leaves the blocks scattered,
// it would swap in nodes of other blocks or outside of them. So the pending mutations
// are processed, putting the blocks back in order, when x-for replaces the lookup
// at the start of each run, before it moves anything.
function watch(node, flush) {
    let lookup = Object.getOwnPropertyDescriptor(node, "_x_lookup")?.value;

    lookup instanceof Map && Object.defineProperty(node, "_x_lookup", {
        configurable: true,
        get: () => lookup,
        set(value) {
            flush();
            lookup = value;
        }
    });
}

function initialize() {
    document.body._r_block ??= (() => {
        const observer = new MutationObserver(process);

        // Processes the mutations made so far, without waiting for the observer
        const flush = () => process(observer.takeRecords());

        function process(mutations) {
            const parents = new Set();
            const lists = new Set();
            const inserted = new Map();

            for (let mutation of mutations) {
                // x-for moves the last node of the block right after its template, which
                // may be all it does when the order stays the same. That node can belong
                // to a nested x-for or x-if, rather than the block itself.
                mutation.previousSibling?._r_block && parents.add(mutation.target);

                for (let list of [mutation.addedNodes, mutation.removedNodes]) {
                    for (let node of list) {
                        (node._r_block || node._r_anchor) && parents.add(mutation.target);
                        node._x_refreshXForScope && lists.add(mutation.target);
                    }
                }

                for (let node of mutation.addedNodes) {
                    node._x_refreshXForScope && (inserted.has(node) || inserted.set(node, mutation.previousSibling));
                }
            }

            // Record the order of the items just added by x-for, while the records of their
            // insertion are at hand. Since blocks render their content next to their templates,
            // x-for of the blocks, including the ones rendered by x-if, share the parent with them.
            // Updating the order after removals as well releases the removed items.
            for (let parent of lists) {
                const nodes = [...parent.childNodes];

                if (nodes.some(node => node._r_block)) {
                    for (let node of nodes) {
                        if (node._x_lookup) {
                            x_for_items(node, inserted);
                            watch(node, flush);
                        }
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

            // Restoring only puts the existing nodes back in place,
            // so the records it produces need no further handling
            observer.takeRecords();
        }

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    })();
}
