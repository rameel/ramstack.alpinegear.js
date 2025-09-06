import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-format", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
            [{{ name }},{{ title }}]
        </div>`);

    await expect(page.locator("div")).toContainText("[Foo,Bar]");
});

test("x-format: recursively", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
            [<span>{{ name }}</span>,<span>{{ title }}</span>]
        </div>`);

    await expect(page.locator("div")).toContainText("[Foo,Bar]");
});

test("x-format: attributes", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
            [<span title="({{ name }}:{{ title }})">{{ name }},{{ title }}</span>]
        </div>`);

    await expect(page.locator("div")).toContainText("[Foo,Bar]");
    await expect(page.locator("span")).toHaveAttribute("title", "(Foo:Bar)");
});

test("x-format: context aware", async ({ page }) => {
    await set_html(page, `
        <div x-data x-format>
            <span id="id_1">{{ $el.id }}</span>
            <span id="id_2">{{ $el.id }}<span id="id_3" title="{{ $el.id }}"><span id="id_4">{{ $el.id }}</span></span></span>
        </div>`);

    await expect(page.locator("#id_1")).toContainText("id_1");
    await expect(page.locator("#id_2")).toContainText("id_2id_4");
    await expect(page.locator("#id_4")).toContainText("id_4");
    await expect(page.locator("#id_3")).toHaveAttribute("title", "id_3");
});
