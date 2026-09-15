import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

test("x-markdown renders reactive Markdown", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '# Hello **world**' }">
            <button @click="content = '## Updated *text*'">Update</button>
            <div id="content" x-markdown="content"></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("h1")).toHaveText("Hello world");
    await expect(content.locator("h1")).toHaveAttribute("id", "hello-world");
    await expect(content.locator("strong")).toHaveText("world");

    await page.locator("button").click();

    await expect(content.locator("h2")).toHaveText("Updated text");
    await expect(content.locator("em")).toHaveText("text");
});

for (const [value, expected] of [[0, "0"], [false, "false"]]) {
    test(`x-markdown renders the reactive '${expected}' value`, async ({ page }) => {
        await set_html(page, `
            <div x-data="{ content: ${value} }">
                <div id="content" x-markdown="content"></div>
            </div>`);

        await expect(page.locator("#content")).toHaveText(expected);
    });
}

test("x-markdown escapes raw HTML and removes unsafe URLs by default", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '<img src=x onerror=window.injected=true><script>window.injected=true</script> [link](javascript:window.injected=true)' }">
            <div id="content" x-markdown="content"></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("img")).not.toBeAttached();
    await expect(content.locator("script")).not.toBeAttached();
    await expect(content.locator("a")).not.toBeAttached();
    await expect(content).toContainText("<img src=x onerror=window.injected=true>");
    await expect(content).toContainText("link");
    expect(await page.evaluate(() => window.injected)).toBeUndefined();
});

test("x-markdown renders raw HTML with the allowHtml option", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: 'Hello<br><strong>world</strong>' }">
            <div id="content" x-markdown="content" data-markdown-options='{ "allowHtml": true }'></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("br")).toBeAttached();
    await expect(content.locator("strong")).toHaveText("world");
});

test("x-markdown.content and x-markdown.static render the element content", async ({ page }) => {
    await set_html(page, `
        <div id="content" x-markdown.content>
            # Hello

            Some **bold** text
        </div>

        <div id="static" x-markdown.static>## Alias</div>`);

    const content = page.locator("#content");

    await expect(content.locator("h1")).toHaveText("Hello");
    await expect(content.locator("strong")).toHaveText("bold");

    await expect(page.locator("#static h2")).toHaveText("Alias");
});

test("x-markdown forwards supported render options and ignores unknown ones", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '# Title' }">
            <div id="content" x-markdown="content"
                 data-markdown-options='{ "headingAnchors": true, "codeLineNumbers": true, "unknownOption": true }'
            ></div>
        </div>`);

    const content = page.locator("#content");

    await expect(content.locator("h1 a")).toHaveAttribute("href", "#title");
    await expect(content.locator("h1 a")).toHaveClass(/anchor-heading/);
});

test("x-markdown merges global and local options", async ({ page }) => {
    await set_html(page, `
        <meta name="alpinegear-markdown-options" content='{ "allowHtml": true }'>

        <div x-data="{ content: '**markdown** and <em>raw</em>' }">
            <div id="global" x-markdown="content"></div>
            <div id="local"  x-markdown="content" data-markdown-options='{ "allowHtml": false }'></div>
        </div>`);

    await expect(page.locator("#global em")).toHaveText("raw");
    await expect(page.locator("#global strong")).toHaveText("markdown");

    await expect(page.locator("#local em")).not.toBeAttached();
    await expect(page.locator("#local")).toContainText("<em>raw</em>");
    await expect(page.locator("#local strong")).toHaveText("markdown");
});

test("x-markdown ignores invalid local options", async ({ page }) => {
    const warnings = [];
    page.on("console", message => message.type() === "warning" && warnings.push(message.text()));

    await set_html(page, `
        <div x-data="{ content: '<em>escaped</em>' }">
            <div id="content" x-markdown="content" data-markdown-options="invalid"></div>
        </div>`);

    await expect(page.locator("#content em")).not.toBeAttached();
    await expect(page.locator("#content")).toContainText("<em>escaped</em>");

    expect(warnings).toEqual([
        "alpinegear.js: x-markdown options in 'data-markdown-options' must be a valid JSON object"
    ]);
});

test("x-markdown warns without an expression or content modifier", async ({ page }) => {
    const warnings = [];
    page.on("console", message => message.type() === "warning" && warnings.push(message.text()));

    await set_html(page, `
        <div id="content" x-markdown># Hello</div>`);

    await expect(page.locator("#content")).toHaveText("# Hello");

    expect(warnings).toEqual([
        "alpinegear.js: x-markdown requires an expression or the '.content' or '.static' modifier"
    ]);
});

test("x-markdown warns when an expression is combined with a content modifier", async ({ page }) => {
    const warnings = [];
    page.on("console", message => message.type() === "warning" && warnings.push(message.text()));

    await set_html(page, `
        <div x-data="{ content: '# Hello' }">
            <div id="content" x-markdown.content="content"></div>
        </div>`);

    await expect(page.locator("#content")).toBeEmpty();

    expect(warnings).toEqual([
        "alpinegear.js: x-markdown cannot combine an expression with the '.content' or '.static' modifier"
    ]);
});

test("x-markdown cannot be used on a 'template' tag", async ({ page }) => {
    const warnings = [];
    page.on("console", message => message.type() === "warning" && warnings.push(message.text()));

    await set_html(page, `
        <template id="content" x-markdown.content># Hello</template>`);

    expect(await page.evaluate(() => document.getElementById("content").innerHTML)).toBe("# Hello");
    await expect(page.locator("h1")).not.toBeAttached();

    expect(warnings).toEqual([
        "alpinegear.js: x-markdown cannot be used on a 'template' tag"
    ]);
});

test("x-markdown ignores Alpine directives in rendered HTML", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ content: '<button x-init=window.injected=true @click=window.injected=true :title=window.injected=true>Safe</button>' }">
            <div id="content" x-markdown="content" data-markdown-options='{ "allowHtml": true }'></div>
        </div>`);

    const button = page.locator("#content button");

    await expect(button).toHaveText("Safe");
    await expect(button).toHaveAttribute("x-init", "window.injected=true");
    await expect(button).toHaveAttribute("x-ignore", "");

    await page.evaluate(() => Alpine.initTree(document.querySelector("#content button")));

    expect(await page.evaluate(() => window.injected)).toBeUndefined();
});
