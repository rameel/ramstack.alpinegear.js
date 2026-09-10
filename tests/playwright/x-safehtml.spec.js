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
