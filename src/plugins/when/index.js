import { anchor_block } from "@/utilities/anchor_block";
import { create_getter } from "@/utilities/evaluator";
import { is_template, warn } from "@/utilities/utils";

function plugin({ addScopeToNode, directive, initTree, mutateDom }) {
    directive("when", (el, { expression }, { cleanup, effect, evaluateLater }) => {
        if (!is_template(el)) {
            warn("x-when can only be used on a 'template' tag.");
            return;
        }

        const activate = () => anchor_block(el, el, { addScopeToNode, cleanup, initTree, mutateDom });
        const clear = () => el._r_block?.delete();

        const get = create_getter(evaluateLater, expression);
        effect(() => get() ? activate() : clear());
    });
}

export default plugin;
export {
    plugin as when
}
