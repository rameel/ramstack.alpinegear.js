import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-safehtml sanitizes reactive HTML", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '<p>Hello <strong>world</strong></p><img src=x onerror=window.injected=true><script>window.injected=true</script>' }">
            <button @click="content = '<a href=javascript:window.injected=true onclick=window.injected=true>Updated</a>'">Update</button>
            <div id="content" x-safehtml="content"></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("strong")).toHaveText("world");
    await expect(content.locator("script")).not.toBeAttached();
    await expect(content.locator("img")).not.toHaveAttribute("onerror");
    expect(await page.evaluate(() => window.injected)).toBeUndefined();

    await page.locator("button").click();

    await expect(content.locator("a")).toHaveText("Updated");
    await expect(content.locator("a")).not.toHaveAttribute("href");
    await expect(content.locator("a")).not.toHaveAttribute("onclick");
    expect(await page.evaluate(() => window.injected)).toBeUndefined();
});

test("x-safehtml removes Alpine attributes with DOMPurify defaults", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '<button x-init=window.injected=true @click=window.injected=true :title=window.injected=true &value=window.injected=true>Safe</button>' }">
            <div id="content" x-safehtml="content"></div>
        </div>`);

    const button = page.locator("#content button");

    await expect(button).toHaveText("Safe");
    await expect(button).not.toHaveAttribute("x-init");
    await expect(button).not.toHaveAttribute("@click");
    await expect(button).not.toHaveAttribute(":title");
    await expect(button).not.toHaveAttribute("&value");
    await expect(button).toHaveAttribute("x-ignore", "");
    expect(await page.evaluate(() => window.injected)).toBeUndefined();
});

test("x-safehtml merges global and local options", async ({ page }) => {
    await set_html(page, `
        <meta name="alpinegear-safehtml-options" content='{ "ALLOWED_TAGS": ["p", "strong"], "FORBID_ATTR": ["title"] }'>
        <div x-data="{ content: '<p title=removed><strong>Global</strong><em>Local</em></p>' }">
            <div id="content" x-safehtml="content" data-safehtml-options='{ "ALLOWED_TAGS": ["p", "em"], "IN_PLACE": true, "RETURN_DOM": true, "RETURN_DOM_FRAGMENT": true }'></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("p")).not.toHaveAttribute("title");
    await expect(content.locator("strong")).not.toBeAttached();
    await expect(content.locator("em")).toHaveText("Local");
});

test("x-safehtml ignores invalid local options", async ({ page }) => {
    const warnings = [];
    page.on("console", message => message.type() === "warning" && warnings.push(message.text()));

    await set_html(page, `
        <meta name="alpinegear-safehtml-options" content='{ "ALLOWED_TAGS": ["p"] }'>
        <div x-data="{ content: '<p>Kept</p><strong>Removed</strong>' }">
            <div id="content" x-safehtml="content" data-safehtml-options="invalid"></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("p")).toHaveText("Kept");
    await expect(content.locator("strong")).not.toBeAttached();
    expect(warnings).toEqual([
        "alpinegear.js: x-safehtml options in 'data-safehtml-options' must be a valid JSON object"
    ]);
});

test("x-safehtml ignores Alpine directives and custom attribute mappings", async ({ page }) => {
    await page.addInitScript(() => {
        document.addEventListener("alpine:init", () => {
            Alpine.prefix("data-x-");
            Alpine.mapAttributes(attribute => ({
                name: attribute.name.replace(/^data-run$/, Alpine.prefixed("init")),
                value: attribute.value
            }));
        });
    });

    await set_html(page, `
        <div data-x-data="{ content: '<button x-init=window.injected=true data-x-init=window.injected=true @click=window.injected=true :title=window.injected=true &value=window.injected=true data-run=window.injected=true>Safe</button>' }">
            <div
                id="content"
                data-x-safehtml="content"
                data-safehtml-options='{ "ADD_ATTR": ["x-init", "data-x-init", "@click", ":title", "&value"] }'
            ></div>
        </div>`);

    const button = page.locator("#content button");

    await expect(button).toHaveText("Safe");
    await expect(button).toHaveAttribute("x-init", "window.injected=true");
    await expect(button).toHaveAttribute("data-x-init", "window.injected=true");
    await expect(button).toHaveAttribute("@click", "window.injected=true");
    await expect(button).toHaveAttribute(":title", "window.injected=true");
    await expect(button).toHaveAttribute("&value", "window.injected=true");
    await expect(button).toHaveAttribute("data-run", "window.injected=true");
    await expect(button).toHaveAttribute("data-x-ignore", "");

    await page.evaluate(() => {
        Alpine.prefix("later-");
        Alpine.initTree(document.querySelector("#content"));
    });

    expect(await page.evaluate(() => window.injected)).toBeUndefined();
});
