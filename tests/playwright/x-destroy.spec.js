import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-destroy", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ value: 'Foo', show: true }">
            <span x-text="value"></span>
            <template x-when="show">
                <i x-destroy="value = 'Bar'"></i>
            </template>
            <button @click="show = false">Hide</button>
        </div>`);

    await expect(page.locator("span")).toHaveText("Foo");
    await page.locator("button").click();
    await expect(page.locator("span")).toHaveText("Bar");
});
