import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-template", async ({ page }) => {
    await set_html(page, `
        <template id="tpl">
            <template x-if="show">
                <span x-format>{{ value }}</span>
            </template>
        </template>
        <div x-data="{ value: 'Foo', show: true }">
            <div x-template="tpl"></div>
        </div>`);

    await expect(page.locator("span")).toHaveText("Foo");
});

test("x-template does not throw when element id does not exist", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
        if (msg.type() === "warning") {
            errors.push(msg.text());
        }
    });

    await set_html(page, `
        <div x-data>
            <div id="host" x-template="non-existent-id"></div>
        </div>`);

    expect(errors).toEqual(["alpinegear.js: x-template directive can only reference the template tag"]);
});

test("x-template does not render when referenced element is not a template tag", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
        if (msg.type() === "warning") {
            errors.push(msg.text());
        }
    });

    await set_html(page, `
        <div id="not-a-template"><span>should not appear</span></div>
        <div x-data>
            <div id="host" x-template="not-a-template"></div>
        </div>`);

    expect(errors).toEqual(["alpinegear.js: x-template directive can only reference the template tag"]);
    await expect(page.locator("#host")).toBeEmpty();
});

test("x-template does not render when used on a template element itself", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
        if (msg.type() === "warning") {
            errors.push(msg.text());
        }
    });

    await set_html(page, `
        <template id="tpl"><span>content</span></template>
        <div x-data>
            <template id="host" x-template="tpl"></template>
        </div>`);

    expect(errors).toEqual(["alpinegear.js: x-template cannot be used on a 'template' tag"])
});
