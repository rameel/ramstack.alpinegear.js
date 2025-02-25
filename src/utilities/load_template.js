import { warn } from "@/utilities/utils";

export async function load_template(path) {
    let result;
    try {
        result = await fetch(path);
    }
    catch {
        // skip
    }

    if (!result?.ok) {
        warn(`Failed to load template from ${ path }`);
        return new DocumentFragment();
    }

    const fragment = new DocumentFragment();
    const document = new DOMParser().parseFromString(await result.text(), "text/html");

    fragment.append(...document.body.childNodes);
    return fragment;
}
