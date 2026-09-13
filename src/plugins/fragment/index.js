import { anchor_block } from "@/utilities/anchor_block";
import { is_template, warn } from "@/utilities/utils";

function plugin({ addScopeToNode, directive, destroyTree, initTree, mutateDom }) {
    directive("fragment", (el, {}, { cleanup }) => {
        if (!is_template(el)) {
            warn("x-fragment can only be used on a 'template' tag");
            return;
        }

        anchor_block(el, el, { addScopeToNode, cleanup, destroyTree, initTree, mutateDom });
    });
}

export default plugin;
export {
    plugin as fragment
}
