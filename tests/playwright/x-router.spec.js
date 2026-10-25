import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

// The page is opened from a file: URL, where the html5 history cannot change the path,
// so the tests use the hash history

// Records whether the router took over the click, and keeps the browser from following the link
const capture_clicks = page => page.evaluate(() => {
    document.addEventListener("click", e => {
        window.prevented = e.defaultPrevented;
        e.preventDefault();
    });
});

test.describe("x-router: link", () => {
    test("external links are left to the browser", async ({ page }) => {
        await set_html(page, `
            <div x-data x-router:hash>
                <a x-router:link href="https://example.com/about">Example</a>
                <a x-router:link href="mailto:user@example.com">Mail</a>
                <a x-router:link href="tel:+123456">Phone</a>
            </div>`);

        await capture_clicks(page);

        for (let link of await page.locator("a").all()) {
            await link.click();
            expect(await page.evaluate(() => window.prevented)).toBe(false);
            expect(await page.evaluate(() => location.hash)).toBe("");
        }
    });

    test("internal link is handled by the router", async ({ page }) => {
        await set_html(page, `
            <div x-data x-router:hash>
                <a x-router:link href="/about">About</a>
            </div>`);

        await capture_clicks(page);

        await page.locator("a").click();
        expect(await page.evaluate(() => window.prevented)).toBe(true);
        expect(await page.evaluate(() => location.hash)).toBe("#/about");
    });
});

test.describe("x-router: $active", () => {
    test("external link with the current path is not active", async ({ page }) => {
        await set_html(page, `
            <div x-data x-router:hash>
                <template x-route="/"></template>
                <a id="home" x-router:link href="/" :class="{ active: $active }">Home</a>
                <a id="example" x-router:link href="https://example.com/" :class="{ active: $active }">Example</a>
            </div>`);

        // Wait until the router activates the current route
        await expect(page.locator("#home")).toHaveClass("active");
        await expect(page.locator("#example")).not.toHaveClass("active");
    });
});
