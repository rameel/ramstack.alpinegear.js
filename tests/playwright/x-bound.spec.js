import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";
import { fileURLToPath } from "url";
import path from "path";

test.describe("x-bound: checkbox", () => {
    test("checkbox", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ checked: true }">
                <input type="checkbox" &checked />
                <span x-format>{{ checked }}</span>
            </div>`);

        await expect(page.locator("input")).toBeChecked();
        await expect(page.locator("span")).toHaveText("true");
        await page.locator("input").click();
        await expect(page.locator("input")).not.toBeChecked();
        await expect(page.locator("span")).toHaveText("false");
    });

    test("checkbox:indeterminate", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ indeterminate: true }">
                <input type="checkbox" &indeterminate />
                <button @click="indeterminate = !indeterminate">Inverse</button>
                <span x-format>{{ indeterminate }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveJSProperty('indeterminate', true);
        await expect(page.locator("span")).toHaveText("true");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', true);
        await expect(page.locator("span")).toHaveText("true");

        await page.locator("input").click();
        await expect(page.locator("input")).toBeChecked();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("input").click();
        await expect(page.locator("input")).not.toBeChecked();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");
    });

    test("checkbox:indeterminate - initialize from undefined", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ indeterminate: undefined }">
                <input type="checkbox" &indeterminate />
                <button @click="indeterminate = !indeterminate">Clear indeterminate</button>
                <span x-format>{{ indeterminate }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', true);
        await expect(page.locator("span")).toHaveText("true");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");
    });

    test("checkbox:indeterminate - initialize from null", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ indeterminate: null }">
                <input type="checkbox" &indeterminate />
                <button @click="indeterminate = !indeterminate">Clear indeterminate</button>
                <span x-format>{{ indeterminate }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', true);
        await expect(page.locator("span")).toHaveText("true");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveJSProperty('indeterminate', false);
        await expect(page.locator("span")).toHaveText("false");
    });

    test("radio", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ checked: true }">
                <input type="radio" &checked />
                <button @click="checked = false">Uncheck</button>
                <span x-format>{{ checked }}</span>
            </div>`);

        await expect(page.locator("input")).toBeChecked();
        await expect(page.locator("span")).toHaveText("true");
        await page.locator("button").click();
        await expect(page.locator("input")).not.toBeChecked();
        await expect(page.locator("span")).toHaveText("false");
    });
});

test.describe("x-bound: input", () => {
    test("input", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: 'John' }">
                <input &value />
                <button @click="value = 'Smith'">Click</button>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveValue("John");
        await expect(page.locator("span")).toHaveText("John");

        await page.locator("button").click();
        await expect(page.locator("input")).toHaveValue("Smith");
        await expect(page.locator("span")).toHaveText("Smith");

        await page.locator("input").clear();
        await page.locator("input").fill("John Smith");
        await expect(page.locator("input")).toHaveValue("John Smith");
        await expect(page.locator("span")).toHaveText("John Smith");
    });

    test("textarea", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: 'John' }">
                <textarea &value></textarea>
                <button @click="value = 'Smith'">Click</button>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("textarea")).toHaveValue("John");
        await expect(page.locator("span")).toHaveText("John");

        await page.locator("button").click();
        await expect(page.locator("textarea")).toHaveValue("Smith");
        await expect(page.locator("span")).toHaveText("Smith");

        await page.locator("textarea").clear();
        await page.locator("textarea").fill("John Smith");
        await expect(page.locator("textarea")).toHaveValue("John Smith");
        await expect(page.locator("span")).toHaveText("John Smith");
    });

    test("initialize from element when property is null", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: null }">
                <input &value value="John" />
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveValue("John");
        await expect(page.locator("span")).toHaveText("John");
    });

    test("initialize from element when property is undefined", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: undefined }">
                <input &value value="John" />
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("input")).toHaveValue("John");
        await expect(page.locator("span")).toHaveText("John");
    });
});

test.describe("x-bound: numeric", () => {
    test("number", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: null }">
                <input &value type="number" value="2" />
                <button @click="value = 3">Set 3</button>
                <span x-format>{{ value + 5 }}</span>
            </div>`);

        await expect(page.locator("span")).toHaveText("7");
        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("8");
        await page.locator("input").clear();
        await expect(page.locator("span")).toHaveText("5");
        await page.locator("input").fill("15");
        await expect(page.locator("span")).toHaveText("20");
    });

    test("range", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: null }">
                <input &value type="range" value="2" min="0" max="15" />
                <button @click="value = 3">Set 3</button>
                <span x-format>{{ value + 5 }}</span>
            </div>`);

        await expect(page.locator("span")).toHaveText("7");
        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("8");
        await page.locator("input").fill("0");
        await expect(page.locator("span")).toHaveText("5");
        await page.locator("input").fill("15");
        await expect(page.locator("span")).toHaveText("20");
    });
});

test.describe("x-bound: files", () => {
    const dirname = path.dirname(
        fileURLToPath(import.meta.url));

    const file1 = path.resolve(dirname, "assets/dummy-617x398.png");
    const file2 = path.resolve(dirname, "assets/test.webm");

    test("Initialize from null", async ({ page }) => {
        await set_html(page, `
            <div x-data="{
                files: null,
                clear() {
                    this.files = new DataTransfer().files;
                }}">

                <input id="f1" &files type="file" />
                <input id="f2" &files type="file" multiple />

                <span x-format>{{ files.length ? [...files].map(f => f.name).join("|") : "No file selected" }}</span>

                <button @click="clear">Clear</button>
            </div>`);

        await expect(page.locator("span")).toHaveText("No file selected");

        await page.locator("#f1").setInputFiles([file1]);
        await expect(page.locator("span")).toHaveText("dummy-617x398.png");

        await page.locator("#f1").setInputFiles([file2]);
        await expect(page.locator("span")).toHaveText("test.webm");

        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("No file selected");

        await page.locator("#f2").setInputFiles([file1, file2]);
        await expect(page.locator("span")).toHaveText("dummy-617x398.png|test.webm");

        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("No file selected");
    });

    test("Initialize from empty array", async ({ page }) => {
        await set_html(page, `
            <div x-data="{
                files: [],
                clear() {
                    this.files = new DataTransfer().files;
                }}">

                <input id="f1" &files type="file" />
                <input id="f2" &files type="file" multiple />

                <span x-format>{{ files.length ? [...files].map(f => f.name).join("|") : "No file selected" }}</span>

                <button @click="clear">Clear</button>
            </div>`);

        await expect(page.locator("span")).toHaveText("No file selected");

        await page.locator("#f1").setInputFiles([file1]);
        await expect(page.locator("span")).toHaveText("dummy-617x398.png");

        await page.locator("#f1").setInputFiles([file2]);
        await expect(page.locator("span")).toHaveText("test.webm");

        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("No file selected");

        await page.locator("#f2").setInputFiles([file1, file2]);
        await expect(page.locator("span")).toHaveText("dummy-617x398.png|test.webm");

        await page.locator("button").click();
        await expect(page.locator("span")).toHaveText("No file selected");
    });
});

test.describe("x-bound: select", () => {
    test("select", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: '2' }">
                <select &value>
                    <option value="1">One</option>
                    <option value="2">Two</option>
                    <option value="3">Three</option>
                </select>
                <button @click="value = '3'">Click</button>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValue("2");
        await expect(page.locator("span")).toHaveText("2");

        await page.locator("button").click();
        await expect(page.locator("select")).toHaveValue("3");
        await expect(page.locator("span")).toHaveText("3");

        await page.locator("select").selectOption("1");
        await expect(page.locator("select")).toHaveValue("1");
        await expect(page.locator("span")).toHaveText("1");
    });

    test("select (render options)", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: '2', options: ['1', '2', '3'] }">
                <select &value>
                    <template x-for="v in options">
                        <option :value="v" x-text="v"></option>
                    </template>
                </select>
                <button @click="value = '3'">Click</button>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValue("2");
        await expect(page.locator("span")).toHaveText("2");

        await page.locator("button").click();
        await expect(page.locator("select")).toHaveValue("3");
        await expect(page.locator("span")).toHaveText("3");

        await page.locator("select").selectOption("1");
        await expect(page.locator("select")).toHaveValue("1");
        await expect(page.locator("span")).toHaveText("1");
    });

    test("initialize from element when property is null", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: null }">
                <select &value>
                    <option value="1">One</option>
                    <option value="2" selected>Two</option>
                    <option value="3">Three</option>
                </select>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValue("2");
        await expect(page.locator("span")).toHaveText("2");
    });

    test("initialize from element when property is undefined", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: undefined }">
                <select &value>
                    <option value="1">One</option>
                    <option value="2" selected>Two</option>
                    <option value="3">Three</option>
                </select>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValue("2");
        await expect(page.locator("span")).toHaveText("2");
    });

    test("select multiple", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: ['One', 'Three'], options: ['One', 'Two', 'Three'] }">
                <select &value multiple>
                    <template x-for="option in options">
                        <option :value="option" x-text="option"></option>
                    </template>
                </select>
                <span x-format>{{ JSON.stringify(value) }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValues(["One", "Three"]);
        await expect(page.locator("span")).toHaveText(`["One","Three"]`);

        await page.locator("select").selectOption(["Two", "Three"]);
        await expect(page.locator("select")).toHaveValues(["Two", "Three"]);
        await expect(page.locator("span")).toHaveText(`["Two","Three"]`);

        await page.locator("select").selectOption([]);
        await expect(page.locator("select")).toHaveValues([]);
        await expect(page.locator("span")).toHaveText(`[]`);
    });

    test("select multiple (primitive value)", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: 'Two', options: ['One', 'Two', 'Three'] }">
                <select &value multiple>
                    <template x-for="option in options">
                        <option :value="option" x-text="option"></option>
                    </template>
                </select>
                <span x-format>{{ JSON.stringify(value) }}</span>
            </div>`);

        await expect(page.locator("select")).toHaveValues(["Two"]);
        await expect(page.locator("span")).toHaveText(`"Two"`);

        await page.locator("select").selectOption([]);
        await expect(page.locator("select")).toHaveValues([]);
        await expect(page.locator("span")).toHaveText(`[]`);

        await page.locator("select").selectOption(["Two", "Three"]);
        await expect(page.locator("select")).toHaveValues(["Two", "Three"]);
        await expect(page.locator("span")).toHaveText(`["Two","Three"]`);
    });
});

test.describe("x-bound: contenteditable", () => {
    test("innerHTML", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ innerHTML: '<h1>Sample</h1>' }">
                <pre contenteditable &innerHTML></pre>
                <button @click="innerHTML='Hello!'">Click</button>
                <span x-format>{{ innerHTML }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("<h1>Sample</h1>");
        await page.locator("button").click();
        await expect(page.locator("span")).toContainText("Hello!");
        await page.locator("pre").clear();
        await page.locator("pre").fill("Hello World!");
        await expect(page.locator("span")).toContainText("Hello World!");
    });

    test("supports contenteditable='plaintext-only'", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ innerHTML: '<h1>Sample</h1>' }">
                <pre contenteditable="plaintext-only" &innerHTML></pre>
                <button @click="innerHTML='Hello!'">Click</button>
                <span x-format>{{ innerHTML }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("<h1>Sample</h1>");
        await page.locator("button").click();
        await expect(page.locator("span")).toContainText("Hello!");
        await page.locator("pre").clear();
        await page.locator("pre").fill("Hello World!");
        await expect(page.locator("span")).toContainText("Hello World!");
    });

    test("innerHTML (initliaze from element when property is null)", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ innerHTML: null }">
                <pre contenteditable &innerHTML>Hello!</pre>
                <span x-format>{{ innerHTML }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("Hello!");
    });

    test("innerText", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ innerText: 'Sample' }">
                <pre contenteditable &innerText></pre>
                <button @click="innerText='Hello!'">Click</button>
                <span x-format>{{ innerText }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("Sample");
        await page.locator("button").click();
        await expect(page.locator("span")).toContainText("Hello!");
        await page.locator("pre").clear();
        await page.locator("pre").fill("Hello World!");
        await expect(page.locator("span")).toContainText("Hello World!");
    });

    test("innerText (initliaze from element when property is null)", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ innerText: null }">
                <pre contenteditable &innerText>Hello!</pre>
                <span x-format>{{ innerText }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("Hello!");
    });

    test("textContent", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ textContent: 'Sample' }">
                <pre contenteditable &textContent></pre>
                <button @click="textContent='Hello!'">Click</button>
                <span x-format>{{ textContent }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("Sample");
        await page.locator("button").click();
        await expect(page.locator("span")).toContainText("Hello!");
        await page.locator("pre").clear();
        await page.locator("pre").fill("Hello World!");
        await expect(page.locator("span")).toContainText("Hello World!");
    });

    test("textContent (initliaze from element when property is null)", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ textContent: null }">
                <pre contenteditable &textContent>Hello!</pre>
                <span x-format>{{ textContent }}</pre>
            </div>`);

        await expect(page.locator("span")).toContainText("Hello!");
    });
});

test.describe("x-bound: details", () => {
    test("details", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: true }">
                <details &open>
                    <summary>Header</summary>
                    Hello World!
                </details>
                <button @click="open = false">Toggle</button>
                <span x-format>{{ open }}</span>
            </div>`);

        await expect(page.locator("details")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");

        await page.locator("button").click();
        await expect(page.locator("details")).not.toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("details").click();
        await expect(page.locator("details")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");
    });

    test("initiaize from element when property is null", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: null }">
                <details &open open>
                    <summary>Header</summary>
                    Hello World!
                </details>
                <span x-format>{{ open }}</span>
            </div>`);

        await expect(page.locator("details")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");
    });

    test("initiaize from element when property is undefined", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: undefined }">
                <details &open open>
                    <summary>Header</summary>
                    Hello World!
                </details>
                <span x-format>{{ open }}</span>
            </div>`);

        await expect(page.locator("details")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");
    });
});

test.describe("x-bound: dialog", () => {
    test("dialog: initialize state from element", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: false }">
                <dialog &open open>
                    Hello World!
                </dialog>
                <span x-format>{{ open }}</span>
            </div>
        `);

        await expect(page.locator("dialog")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");
    });

    test("dialog: always initialize from element", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: true }">
                <dialog &open>
                    Hello World!
                </dialog>
                <span x-format>{{ open }}</span>
            </div>
        `);

        await expect(page.locator("dialog")).not.toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("false");
    });

    test("dialog: property changes do not directly control element.open", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: true }">
                <dialog &open>
                    Hello World!
                </dialog>
                <button @click="open = true">Toggle</button>
                <span x-format>{{ open }}</span>
            </div>
        `);

        // initial state comes from dialog (closed by default)
        await expect(page.locator("dialog")).not.toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("false");

        await page.locator("button").click();

        // property changes, but dialog state is not affected
        await expect(page.locator("dialog")).not.toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");
    });

    test("dialog: native open updates bound state", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ open: false }">
                <dialog &open>
                    Hello World!
                </dialog>
                <span x-format>{{ open }}</span>
            </div>
        `);

        await page.evaluate(() => document.querySelector("dialog").showModal());

        await expect(page.locator("dialog")).toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("true");

        await page.evaluate(() => document.querySelector("dialog").close());

        await expect(page.locator("dialog")).not.toHaveAttribute("open");
        await expect(page.locator("span")).toHaveText("false");
    });
});

test.describe("x-bound: group", () => {
    test("radio", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: 2 }">
                <label><input type="radio" &group="value" value="1" /> 1</label>
                <label><input type="radio" &group="value" value="2" /> 2</label>
                <label><input type="radio" &group="value" value="3" /> 3</label>
                <button @click="value = '3'">Select 3</button>
                <span x-format>{{ value }}</span>
            </div>`);

        await expect(page.locator("input[value='1']")).not.toBeChecked();
        await expect(page.locator("input[value='2']")).toBeChecked();
        await expect(page.locator("input[value='3']")).not.toBeChecked();

        await page.locator("button").click();
        await expect(page.locator("input[value='1']")).not.toBeChecked();
        await expect(page.locator("input[value='2']")).not.toBeChecked();
        await expect(page.locator("input[value='3']")).toBeChecked();
        await expect(page.locator("span")).toHaveText("3");
    });

    test("checkbox", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ value: 2 }">
                <label><input type="checkbox" &group="value" value="1" /> 1</label>
                <label><input type="checkbox" &group="value" value="2" /> 2</label>
                <label><input type="checkbox" &group="value" value="3" /> 3</label>
                <button @click="value = [1,3]">Select 1 and 3</button>
                <span x-format>{{ JSON.stringify(value) }}</span>
            </div>`);

        await expect(page.locator("input[value='1']")).not.toBeChecked();
        await expect(page.locator("input[value='2']")).toBeChecked();
        await expect(page.locator("input[value='3']")).not.toBeChecked();

        await page.locator("button").click();
        await expect(page.locator("input[value='1']")).toBeChecked();
        await expect(page.locator("input[value='2']")).not.toBeChecked();
        await expect(page.locator("input[value='3']")).toBeChecked();
        await expect(page.locator("span")).toHaveText("[1,3]");

        await page.locator("input[value='1']").uncheck();
        await page.locator("input[value='2']").uncheck();
        await page.locator("input[value='3']").uncheck();
        await expect(page.locator("span")).toHaveText("[]");

        await page.locator("input[value='2']").check();
        await expect(page.locator("span")).toHaveText('["2"]');

        await page.locator("input[value='1']").check();
        await expect(page.locator("span")).toHaveText('["2","1"]');
    });
});

test.describe("x-bound: dimensions", () => {
    test("clientWidth & clientHeight, offsetWidth & offsetHeight", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ cw: 0, ch: 0, ow: 0, oh: 0, size: '10px', text: 'Text' }">
                <input &value="text" />
                <div &clientWidth="cw" &clientHeight="ch" &offsetWidth="ow" &offsetHeight="oh" style="display: inline-block">
                    <span x-format style="font-size: {{ size }}">{{ text }}</span>
                </div>
                <button @click="size = '150px'">Change size</button>
                <pre x-format>{{ cw }},{{ ch }},{{ ow }},{{ oh }}</pre>
            </div>`);

        await expect(page.locator("pre")).toContainText(/^\d{2},\d{2},\d{2},\d{2}$/);
        await page.locator("button").click();
        await expect(page.locator("pre")).toContainText(/^\d{3},\d{3},\d{3},\d{3}$/);
    });

    test("naturalWidth & naturalHeight", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ w: 0, h: 0 }">
                <img &naturalWidth="w" &naturalHeight="h" width="250" src="dummy-617x398.png" alt="" />
                <pre x-format>{{ w }},{{ h }}</pre>
            </div>`);

        await expect(page.locator("pre")).toContainText(/^617,398$/);
    });

    test("videoWidth & videoHeight", async ({ page }) => {
        await page.route('**/mov_bbb.mp4', (route) => {
            console.log('Video file requested');
            route.continue();
        });

        await set_html(page, `
            <div x-data="{ w: 0, h: 0 }">
                <video
                    &video-width="w"
                    &video-height="h"
                    width="350"
                    src="test.webm"
                    controls></video>
                <pre x-format>{{ w }},{{ h }}</pre>
            </div>`);

        await expect(page.locator("pre")).toContainText(/^320,176$/);
    });
});

test.describe("x-bound: component", () => {
    test("modifier: in", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ source: '1' }">
                <span id="s1" x-format>{{ source }}</span>
                <button id="b1" @click="source = '2'">Change source</button>

                <div x-data="{ target: '0' }" &target.in="source">
                    <span id="s2" x-format>{{ target }}</span>
                    <button id="b2" @click="target = '3'">Change target</button>
                </div>
            </div>`);

        await expect(page.locator("#s1")).toHaveText("1");
        await expect(page.locator("#s2")).toHaveText("1");

        await page.locator("#b1").click();
        await expect(page.locator("#s1")).toHaveText("2");
        await expect(page.locator("#s2")).toHaveText("2");

        await page.locator("#b2").click();
        await expect(page.locator("#s1")).toHaveText("2");
        await expect(page.locator("#s2")).toHaveText("3");
    });

    test("modifier: out", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ source: '1' }">
                <span id="s1" x-format>{{ source }}</span>
                <button id="b1" @click="source = '2'">Change source</button>

                <div x-data="{ target: '0' }" &target.out="source">
                    <span id="s2" x-format>{{ target }}</span>
                    <button id="b2" @click="target = '3'">Change target</button>
                </div>
            </div>`);

        await expect(page.locator("#s1")).toHaveText("0");
        await expect(page.locator("#s2")).toHaveText("0");

        await page.locator("#b1").click();
        await expect(page.locator("#s1")).toHaveText("2");
        await expect(page.locator("#s2")).toHaveText("0");

        await page.locator("#b2").click();
        await expect(page.locator("#s1")).toHaveText("3");
        await expect(page.locator("#s2")).toHaveText("3");
    });

    test("modifier: inout", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ source: '1' }">
                <span id="s1" x-format>{{ source }}</span>
                <button id="b1" @click="source = '2'">Change source</button>

                <div x-data="{ target: '0' }" &target.inout="source">
                    <span id="s2" x-format>{{ target }}</span>
                    <button id="b2" @click="target = '3'">Change target</button>
                </div>
            </div>`);

        await expect(page.locator("#s1")).toHaveText("1");
        await expect(page.locator("#s2")).toHaveText("1");

        await page.locator("#b1").click();
        await expect(page.locator("#s1")).toHaveText("2");
        await expect(page.locator("#s2")).toHaveText("2");

        await page.locator("#b2").click();
        await expect(page.locator("#s1")).toHaveText("3");
        await expect(page.locator("#s2")).toHaveText("3");
    });

    test("default modifier: inout", async ({ page }) => {
        await set_html(page, `
            <div x-data="{ source: '1' }">
                <span id="s1" x-format>{{ source }}</span>
                <button id="b1" @click="source = '2'">Change source</button>

                <div x-data="{ target: '0' }" &target="source">
                    <span id="s2" x-format>{{ target }}</span>
                    <button id="b2" @click="target = '3'">Change target</button>
                </div>
            </div>`);

        await expect(page.locator("#s1")).toHaveText("1");
        await expect(page.locator("#s2")).toHaveText("1");

        await page.locator("#b1").click();
        await expect(page.locator("#s1")).toHaveText("2");
        await expect(page.locator("#s2")).toHaveText("2");

        await page.locator("#b2").click();
        await expect(page.locator("#s1")).toHaveText("3");
        await expect(page.locator("#s2")).toHaveText("3");
    });
});

