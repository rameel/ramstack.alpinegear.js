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

test("x-format: nested x-data", async ({ page }) => {
    await set_html(page, `
      <div x-data="{ value1: 3.14 }" x-format>
        <div id="d2" x-data="{ value2: 2.71 }" title="{{ value2 }}">
          <span id="v2">{{ value2 }}</span>
          <button id="b2" @click="value2 = 'math.e'">Change</button>
        </div>

        <span id="v1">{{ value1 }}</span>
        <button id="b1" @click="value1 = 'math.pi'">Change</button>
      </div>`);

    await expect(page.locator("#v1")).toContainText("3.14");
    await expect(page.locator("#v2")).toContainText("2.71");
    await expect(page.locator("#d2")).toHaveAttribute("title", "2.71");

    await page.locator("#b1").click();
    await expect(page.locator("#v1")).toContainText("math.pi");

    await page.locator("#b2").click();
    await expect(page.locator("#v2")).toContainText("math.e");
    await expect(page.locator("#d2")).toHaveAttribute("title", "math.e");
});

test("x-format: nested x-data with manually x-format", async ({ page }) => {
    await set_html(page, `
      <div x-data="{ value1: 3.14 }" x-format>
        <div id="d2" x-data="{ value2: 2.71 }" x-format title="{{ value2 }}">
          <span id="v2">{{ value2 }}</span>
          <button id="b2" @click="value2 = 'math.e'">Change</button>
        </div>

        <span id="v1">{{ value1 }}</span>
        <button id="b1" @click="value1 = 'math.pi'">Change</button>
      </div>`);

    await expect(page.locator("#v1")).toContainText("3.14");
    await expect(page.locator("#v2")).toContainText("2.71");
    await expect(page.locator("#d2")).toHaveAttribute("title", "2.71");

    await page.locator("#b1").click();
    await expect(page.locator("#v1")).toContainText("math.pi");

    await page.locator("#b2").click();
    await expect(page.locator("#v2")).toContainText("math.e");
    await expect(page.locator("#d2")).toHaveAttribute("title", "math.e");
});

test("x-format: nested x-format.once is an independent boundary", async ({ page }) => {
    await set_html(page, `
      <div x-data="{ value: 'initial' }" x-format>
        <span id="reactive">{{ value }}</span>
        <span id="once" x-format.once title="{{ value }}">{{ value }}</span>
        <button @click="value = 'changed'">Change</button>
      </div>`);

    await expect(page.locator("#reactive")).toHaveText("initial");
    await expect(page.locator("#once")).toHaveText("initial");
    await expect(page.locator("#once")).toHaveAttribute("title", "initial");

    await page.locator("button").click();

    await expect(page.locator("#reactive")).toHaveText("changed");
    await expect(page.locator("#once")).toHaveText("initial");
    await expect(page.locator("#once")).toHaveAttribute("title", "initial");
});
