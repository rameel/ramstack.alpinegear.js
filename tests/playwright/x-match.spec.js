import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-match", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ value: 1 }">
            <button @click="value++">Increment</button>

            <template x-match>
                <template x-case="value == 1">1</template>
                <template x-case="value == 2">2</template>
                <template x-case="value == 3">3</template>
                <template x-default>Other</template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("1");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("2");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("3");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("Other");
});

test("x-match: cleanup", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ value: 1 }">
            <button @click="value++">Increment</button>

            <template x-match>
                <template x-case="value == 1">1</template>
                <template x-case="value == 2">2</template>
                <template x-case="value == 3">3</template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("1");
    await expect(page.locator("div")).not.toContainText("2");
    await expect(page.locator("div")).not.toContainText("3");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("2");
    await expect(page.locator("div")).not.toContainText("1");
    await expect(page.locator("div")).not.toContainText("3");

    await page.locator("button").click();
    await expect(page.locator("div")).toContainText("3");
    await expect(page.locator("div")).not.toContainText("1");
    await expect(page.locator("div")).not.toContainText("2");

    await page.locator("button").click();
    await expect(page.locator("div")).not.toContainText("1");
    await expect(page.locator("div")).not.toContainText("2");
    await expect(page.locator("div")).not.toContainText("3");
});

test("x-match: scope propogation", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ items: [1,2,3,4] }">
            <template x-for="item in items">
                <template x-match>
                    <template x-case="item == 1">[<span x-text="item"></span>]</template>
                    <template x-case="item == 2">[<span x-text="item"></span>]</template>
                    <template x-case="item == 3">[<span x-text="item"></span>]</template>
                    <template x-default>[<span>Other</span>]</template>
                </template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("[1][2][3][Other]");
});

test("x-match: non-template element on x-case arms", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ items: [1,2,3,4] }">
            <template x-for="item in items">
                <template x-match>
                    <span x-case="item == 1">[<span x-text="item"></span>]</span>
                    <span x-case="item == 2">[<span x-text="item"></span>]</span>
                    <span x-case="item == 3">[<span x-text="item"></span>]</span>
                    <span x-default>[<span>Other</span>]</span>
                </template>
            </template>
        </div>`);

    await expect(page.locator("div")).toContainText("[1][2][3][Other]");
});

test("x-match: x-for", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items">
                <template x-match>
                    <span x-case="item.id == 1">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                    <span x-case="item.id == 2">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                    <template x-default>[<span x-format>{{ item.id }}:{{ item.title }}</span>]</template>
                </template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});

test("x-match: x-for with key", async ({ page }) => {
    await set_html(page, `
        <div id="block" x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
            <div>
                <button @click="items.reverse()">Reverse</button>
            </div>
            <template x-for="item in items" :key="item.id">
                <template x-match>
                    <span x-case="item.id == 1">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                    <span x-case="item.id == 2">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                    <template x-default>[<span x-format>{{ item.id }}:{{ item.title }}</span>]</template>
                </template>
            </template>
        </div>`);

    await expect(page.locator("div#block")).toContainText("[1:item-1][2:item-2][3:item-3]");

    await page.locator("button").click();
    await expect(page.locator("div#block")).toContainText("[3:item-3][2:item-2][1:item-1]");
});
