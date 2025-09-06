import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-fragment", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ show: true }">
            <button @click="show = !show">Toggle</button>
            <template x-if="show">
                <template x-fragment>
                    Before <span>Content</span> After
                </template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("Before Content After");

    await page.locator("button").click();
    await expect(page.locator("div")).not.toContainText("Before Content After");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("Before Content After");
});

test("x-fragment: scope propogation", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ items: [{ title: 'TITLE' }] }">
            <template x-for="item in items">
                <template x-fragment>
                    Before <span x-format>[{{ item.title }}]</span> After
                </template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("Before [TITLE] After");
});

test("x-fragment: x-for", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items">
                <template x-fragment>[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});

test("x-fragment: x-for with key", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items" :key="item.id">
                <template x-fragment>[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});
