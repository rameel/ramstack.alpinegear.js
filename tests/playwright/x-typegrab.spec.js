import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-typegrab focuses element on printable key press", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.keyboard.press("a");

    const is_focused = await page.evaluate(() =>
        document.activeElement?.id === "target"
    );

    expect(is_focused).toBe(true);
});

test("x-typegrab does not steal focus from input", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="active" />
            <input id="target" x-typegrab />
        </div>
    `);

    await page.locator("#active").focus();
    await page.keyboard.press("a");

    const active_id = await page.evaluate(() =>
        document.activeElement?.id
    );

    expect(active_id).toBe("active");
});

test("x-typegrab does not steal focus from textarea", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <textarea id="active"></textarea>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.locator("#active").focus();
    await page.keyboard.press("b");

    const active_id = await page.evaluate(() =>
        document.activeElement?.id
    );

    expect(active_id).toBe("active");
});

test("x-typegrab does not steal focus from contenteditable", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <div id="active" contenteditable="true"></div>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.locator("#active").focus();
    await page.keyboard.press("c");

    const active_id = await page.evaluate(() =>
        document.activeElement?.id
    );

    expect(active_id).toBe("active");
});

test("x-typegrab ignores modifier keys", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.keyboard.press("Control+a");

    const is_focused = await page.evaluate(() =>
        document.activeElement?.id === "target"
    );

    expect(is_focused).toBe(false);
});

test("x-typegrab ignores non-printable keys", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    const is_focused = () => page.evaluate(() => document.activeElement?.id === "target");

    await page.keyboard.press("Enter");
    expect(await is_focused()).toBe(false);

    await page.keyboard.press("Space");
    expect(await is_focused()).toBe(false);

    await page.keyboard.press(" ");
    expect(await is_focused()).toBe(false);
});

test("x-typegrab supports unicode alphabetic keys", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    // keyboard.press() supports only predefined keys
    // and cannot be used for arbitrary Unicode characters.
    // keyboard.type() does not trigger a keydown event with the actual "key" value.
    // Therefore, we manually dispatch a KeyboardEvent to verify Unicode handling.
    await page.evaluate(() => {
        document.dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "ф",
                bubbles: true
            })
        );
    });

    const is_focused = await page.evaluate(() =>
        document.activeElement?.id === "target"
    );

    expect(is_focused).toBe(true);
});

test("x-typegrab works when body is active element", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.evaluate(() => document.body.focus());
    await page.keyboard.press("z");

    const is_focused = await page.evaluate(() =>
        document.activeElement?.id === "target"
    );

    expect(is_focused).toBe(true);
});

test("x-typegrab preserves typed character", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <input id="target" x-typegrab />
        </div>
    `);

    await page.keyboard.press("@");

    await expect(page.locator("#target")).toBeFocused();
    await expect(page.locator("#target")).toHaveValue("@");
});
