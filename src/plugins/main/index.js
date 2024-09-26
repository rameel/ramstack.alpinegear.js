import bound from "@/plugins/bound";
import format from "@/plugins/format";
import fragment from "@/plugins/fragment";
import match from "@/plugins/match";
import template from "@/plugins/template";
import when from "@/plugins/when";

export default function(alpine) {
    bound(alpine);
    format(alpine);
    fragment(alpine);
    match(alpine);
    template(alpine);
    when(alpine);
}

export {
    bound,
    format,
    fragment,
    match,
    template,
    when
}
