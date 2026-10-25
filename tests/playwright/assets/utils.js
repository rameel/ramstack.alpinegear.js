import { fileURLToPath } from "url";
import path from "path";

// With trim, the text nodes are trimmed and the empty ones removed, including in templates,
// so that the formatting of the markup does not add whitespace text nodes
export const set_html = async (page, tpl, { trim = false } = {}) => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));

    await page.goto(`file://${dirname}/page.html`);
    await page.waitForSelector("body[ready]", { state: "attached", timeout: 1000 });

    await page.evaluate(({ html, trim }) => {
        const trim_text = node => {
            for (let child of [...node.childNodes]) {
                if (child.nodeType === Node.TEXT_NODE) {
                    child.data = child.data.trim();
                    child.data || child.remove();
                }
                else {
                    trim_text(child.nodeName === "TEMPLATE" ? child.content : child);
                }
            }
        };

        let template = document.createElement("template");
        template.innerHTML = html;
        trim && trim_text(template.content);

        document.getElementById("root").replaceChildren(template.content);
    }, { html: tpl, trim });
}

// Assigns the data of the Alpine component and waits for the DOM to update
export const set_data = (locator, data) => locator.evaluate(async (el, data) => {
    Object.assign(Alpine.$data(el), data);
    await Alpine.nextTick();
}, data);
