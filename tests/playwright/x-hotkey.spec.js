import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-hotkey triggers expression on matching key", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0 }">
            <div x-hotkey.window.ctrl+k="count++"></div>
            <span x-text="count"></span>
        </div>`);

    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("1");
});

test("x-hotkey does not trigger on non-matching key", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0 }">
            <div x-hotkey.window.ctrl+k="count++"></div>
            <span x-text="count"></span>
        </div>`);

    await page.keyboard.press("Control+j");
    await page.keyboard.press("Control+Shift+k");
    await page.keyboard.press("k");

    await expect(page.locator("span")).toHaveText("0");
});

test("x-hotkey exposes $event in expression", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ type: '' }">
            <div x-hotkey.window.ctrl+k="type = $event.type"></div>
            <span x-text="type"></span>
        </div>`);

    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("keydown");
});

test("x-hotkey sets $event.hotkey to the matched hotkey string", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ name: '' }">
            <div x-hotkey.window.ctrl+k="name = $event.hotkey"></div>
            <span x-text="name"></span>
        </div>`);

    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("ctrl+k");
});

test("x-hotkey .prevent modifier calls preventDefault()", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ prevented: false }">
            <div x-hotkey.window.prevent.ctrl+k="prevented = $event.defaultPrevented"></div>
            <span x-text="prevented"></span>
        </div>`);

    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("true");
});

test("x-hotkey .stop modifier stops event propagation", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ outer: 0, inner: 0 }">
            <div @keydown="if ($event.ctrlKey && $event.key === 'k') outer++">
                <button id="btn" tabindex="0" x-hotkey.stop.ctrl+k="inner++"></button>
            </div>
            <span id="outer" x-text="outer"></span>
            <span id="inner" x-text="inner"></span>
        </div>`);

    await page.locator("#btn").focus();
    await page.keyboard.press("Control+k");

    await expect(page.locator("#inner")).toHaveText("1");
    await expect(page.locator("#outer")).toHaveText("0");
});

test("x-hotkey without .stop modifier does not stop propagation", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ outer: 0, inner: 0 }">
            <div @keydown="if ($event.ctrlKey && $event.key === 'k') outer++">
                <button id="btn" tabindex="0" x-hotkey.ctrl+k="inner++"></button>
            </div>
            <span id="outer" x-text="outer"></span>
            <span id="inner" x-text="inner"></span>
        </div>`);

    await page.locator("#btn").focus();
    await page.keyboard.press("Control+k");

    await expect(page.locator("#inner")).toHaveText("1");
    await expect(page.locator("#outer")).toHaveText("1");
});

test("x-hotkey .window modifier listens on window", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0 }">
            <input id="other" type="text" />
            <div x-hotkey.window.ctrl+k="count++"></div>
            <span x-text="count"></span>
        </div>`);

    await page.locator("#other").focus();
    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("1");
});

test("x-hotkey .document modifier listens on document", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0 }">
            <input id="other" type="text" />
            <div x-hotkey.document.ctrl+k="count++"></div>
            <span x-text="count"></span>
        </div>`);

    await page.locator("#other").focus();
    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("1");
});

test("x-hotkey:keyup listens on keyup event", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ type: '' }">
            <div x-hotkey:keyup.window.ctrl+k="type = $event.type"></div>
            <span x-text="type"></span>
        </div>`);

    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("keyup");
});

test("x-hotkey supports multiple hotkeys via comma-separated values", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0 }">
            <div x-hotkey.window.ctrl+j,ctrl+k="count++"></div>
            <span x-text="count"></span>
        </div>`);

    await page.keyboard.press("Control+j");
    await page.keyboard.press("Control+k");

    await expect(page.locator("span")).toHaveText("2");
});

test("x-hotkey with no expression does not throw", async ({ page }) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e));

    await set_html(page, `
        <div x-data>
            <div x-hotkey.window.ctrl+k></div>
        </div>`);

    await page.keyboard.press("Control+k");

    expect(errors).toHaveLength(0);
});

test("x-hotkey cleans up listener when element is removed", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ count: 0, show: true }">
            <template x-if="show">
                <div id="id_1" x-hotkey.window.ctrl+k="count++"></div>
            </template>
            <button @click="show = false">Remove</button>
            <span x-text="count"></span>
        </div>`);

    await page.keyboard.press("Control+k");
    await expect(page.locator("span")).toHaveText("1");

    const hotkey_el = page.locator("#id_1");
    await expect(hotkey_el).toBeAttached();

    await page.locator("button").click();
    await hotkey_el.waitFor({ state: "detached" });

    await page.keyboard.press("Control+k");
    await expect(page.locator("span")).toHaveText("1");
});
