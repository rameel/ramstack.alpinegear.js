import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-when", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ show: false }">
            <button @click="show = !show">Toggle</button>
            <template x-when="show">
                Header
                <h1>Toggle Me</h1>
                Footer
            </template>
        </div>`);

    await expect(page.locator("div")).not.toContainText("Header");
    await expect(page.locator("h1")).not.toBeAttached();
    await expect(page.locator("div")).not.toContainText("Footer");

    await page.locator("button").click();

    await expect(page.locator("div")).toContainText("Header");
    await expect(page.locator("h1")).toBeAttached();
    await expect(page.locator("div")).toContainText("Footer");

    await page.locator("button").click();
    await expect(page.locator("div")).not.toContainText("Header");
    await expect(page.locator("h1")).not.toBeAttached();
    await expect(page.locator("div")).not.toContainText("Footer");
});

test("x-when: x-ref", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <template x-when="true">
                <ul x-ref="listbox" data-foo="bar">
                    <li x-text="$refs.listbox.dataset.foo"></li>
                </ul>
            </template>
        </div>`);

    await expect(page.locator("li")).toContainText("bar");
});

test("x-when: scope propogation", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ items: [{ id: 1, title: 'item' }] }">
            <template x-for="(item, index) in items">
                <template x-when="item.id > 0">
                    <span x-text="'index:' + index + ', title:' + item.title"></span>
                </template>
            </template>
        </div>`);

    await expect(page.locator("div span")).toContainText("index:0, title:item");
});

test("x-when: x-for", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items">
                <template x-when="item.id > 0">[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});

test("x-when: x-for with key", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items" :key="item.id">
                <template x-when="item.id > 0">[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});
