import { anchor_block } from "@/utilities/anchor_block";
import { create_getter } from "@/utilities/evaluator";
import { is_template, warn } from "@/utilities/utils";

function plugin({ addScopeToNode, directive, initTree, mutateDom }) {
    directive("match", (el, { }, { cleanup, effect, evaluateLater }) => {
        if (!is_template(el)) {
            warn("x-match can only be used on a 'template' tag.");
            return;
        }

        const branches = [];
        const has_default_case = () => branches.some(b => b.default);

        for (let node of el.content.children) {
            const expr = node.getAttribute("x-case");
            if (expr !== null) {
                __DEV && has_default_case() && warn("The x-case directive cannot be appear after x-default.");
                branches.push({ el: node, get_value: create_getter(evaluateLater, expr) });
            }
            else if (node.hasAttribute("x-default")) {
                __DEV && has_default_case() && warn("Only one x-default directive is allowed.");
                branches.push({ el: node, get_value: () => true, default: true });
            }
            else {
                __DEV && warn("Element has no x-case or x-default directive and will be ignored.", node);
            }
        }

        const activate = branch => {
            if (el._r_block?.template !== branch.el) {
                clear();
                anchor_block(el, branch.el, {
                    addScopeToNode,
                    cleanup,
                    initTree,
                    mutateDom
                });
            }
        }

        const clear = () => el._r_block?.delete();

        effect(() => {
            let active;

            for (let branch of branches) {
                if (branch.get_value() && !active) {
                    active = branch;
                }
            }

            active ? activate(active) : clear();
        });
    });
}

export default plugin;
export {
    plugin as match
}
