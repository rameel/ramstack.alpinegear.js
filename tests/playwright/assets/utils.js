import { fileURLToPath } from "url";
import path from "path";

export const set_html = async (page, tpl) => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));

    await page.goto(`file://${dirname}/page.html`);
    await page.waitForSelector("body[ready]", { state: "attached", timeout: 1000 });

    await page.evaluate(template => {
        let root = document.getElementById("root");
        root.innerHTML = template;
    }, tpl);
}
