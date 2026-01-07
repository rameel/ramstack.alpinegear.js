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
