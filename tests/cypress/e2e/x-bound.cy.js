import { html, test } from "../utils";

describe("x-bound: checkbox", () => {
    test("checkbox", html`
        <div x-data="{ checked: true }">
            <input type="checkbox" &checked />
            <span x-format>{{ checked }}</span>
        </div>`, ({ get }) => {

        get(":checkbox").should("be.checked");
        get("span").should("have.text", "true");
        get(":checkbox").click();
        get(":checkbox").should("not.be.checked");
        get("span").should("have.text", "false");
    });

    test("radio", html`
        <div x-data="{ checked: true }">
            <input type="radio" &checked />
            <button @click="checked = false">Uncheck</button>
            <span x-format>{{ checked }}</span>
        </div>`, ({ get }) => {

        get("input").should("be.checked");
        get("span").should("have.text", "true");
        get("button").click();
        get("input").should("not.be.checked");
        get("span").should("have.text", "false");
    });
});

describe("x-bound: input", () => {
    test("input", html`
        <div x-data="{ value: 'John' }">
            <input &value />
            <button @click="value = 'Smith'">Click</button>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("input").should("have.value", "John");
        get("span").should("have.text", "John");

        get("button").click();
        get("input").should("have.value", "Smith");
        get("span").should("have.text", "Smith");

        get("input").clear().type("John Smith");
        get("input").should("have.value", "John Smith");
        get("span").should("have.text", "John Smith");
    });

    test("textarea", html`
        <div x-data="{ value: 'John' }">
            <textarea &value></textarea>
            <button @click="value = 'Smith'">Click</button>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("textarea").should("have.value", "John");
        get("span").should("have.text", "John");

        get("button").click();
        get("textarea").should("have.value", "Smith");
        get("span").should("have.text", "Smith");

        get("textarea").clear().type("John Smith");
        get("textarea").should("have.value", "John Smith");
        get("span").should("have.text", "John Smith");
    });

    test("initialize from element when property is null", html`
        <div x-data="{ value: null }">
            <input &value value="John" />
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("input").should("have.value", "John");
        get("span").should("have.text", "John");
    });

    test("initialize from element when property is undefined", html`
        <div x-data="{ value: undefined }">
            <input &value value="John" />
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("input").should("have.value", "John");
        get("span").should("have.text", "John");
    });
});

describe("x-bound: numeric", () => {
    test("number", html`
        <div x-data="{ value: null }">
            <input &value type="number" value="2" />
            <button @click="value = 3">Set 3</button>
            <span x-format>{{ value + 5 }}</span>
        </div>`, ({ get }) => {

        get("span").should("have.text", "7");
        get("button").click();
        get("span").should("have.text", "8");
        get("input").clear();
        get("span").should("have.text", "5");
        get("input").type("15");
        get("span").should("have.text", "20");
    });

    test("range", html`
        <div x-data="{ value: null }">
            <input &value type="range" value="2" min="0" max="15" />
            <button @click="value = 3">Set 3</button>
            <span x-format>{{ value + 5 }}</span>
        </div>`, ({ get }) => {

        get("span").should("have.text", "7");
        get("button").click();
        get("span").should("have.text", "8");
        get("input").invoke("val", "0").trigger("input");
        get("span").should("have.text", "5");
        get("input").invoke("val", "15").trigger("input");
        get("span").should("have.text", "20");
    });
});

describe("x-bound: select", () => {
    test("select", html`
        <div x-data="{ value: '2' }">
            <select &value>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
            </select>
            <button @click="value = '3'">Click</button>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("select").should("have.value", "2");
        get("span").should("have.text", "2");

        get("button").click();
        get("select").should("have.value", "3");
        get("span").should("have.text", "3");

        get("select").select("1");
        get("select").should("have.value", "1");
        get("span").should("have.text", "1");
    });

    test("select (render options)", html`
        <div x-data="{ value: '2', options: ['1', '2', '3'] }">
            <select &value>
                <template x-for="v in options">
                    <option :value="v" x-text="v"></option>
                </template>
            </select>
            <button @click="value = '3'">Click</button>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("select").should("have.value", "2");
        get("span").should("have.text", "2");

        get("button").click();
        get("select").should("have.value", "3");
        get("span").should("have.text", "3");

        get("select").select("1");
        get("select").should("have.value", "1");
        get("span").should("have.text", "1");
    });

    test("initialize from element when property is null", html`
        <div x-data="{ value: null }">
            <select &value>
                <option value="1">One</option>
                <option value="2" selected>Two</option>
                <option value="3">Three</option>
            </select>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("select").should("have.value", "2");
        get("span").should("have.text", "2");
    });

    test("initialize from element when property is undefined", html`
        <div x-data="{ value: undefined }">
            <select &value>
                <option value="1">One</option>
                <option value="2" selected>Two</option>
                <option value="3">Three</option>
            </select>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("select").should("have.value", "2");
        get("span").should("have.text", "2");
    });

    test("select multiple", html`
        <div x-data="{ value: ['One', 'Three'], options: ['One', 'Two', 'Three'] }">
            <select &value multiple>
                <template x-for="option in options">
                    <option :value="option" x-text="option"></option>
                </template>
            </select>
            <span x-format>{{ JSON.stringify(value) }}</span>
        </div>`, ({ get }) => {

        get("select").invoke("val").should("deep.equal", ["One", "Three"]);
        get("span").should("have.text", `["One","Three"]`);

        get("select").select(["Two", "Three"]);
        get("select").invoke("val").should("deep.equal", ["Two", "Three"]);
        get("span").should("have.text", `["Two","Three"]`);

        get("select").select([]);
        get("select").invoke("val").should("deep.equal", []);
        get("span").should("have.text", `[]`);
    });

    test("select multiple (from primitive value)", html`
        <div x-data="{ value: 'Two', options: ['One', 'Two', 'Three'] }">
            <select &value multiple>
                <template x-for="option in options">
                    <option :value="option" x-text="option"></option>
                </template>
            </select>
            <span x-format>{{ JSON.stringify(value) }}</span>
        </div>`, ({ get }) => {

        get("select").invoke("val").should("deep.equal", ["Two"]);
        get("span").should("have.text", `"Two"`);

        get("select").select([]);
        get("select").invoke("val").should("deep.equal", []);
        get("span").should("have.text", `[]`);

        get("select").select(["Two", "Three"]);
        get("select").invoke("val").should("deep.equal", ["Two", "Three"]);
        get("span").should("have.text", `["Two","Three"]`);
    });
});

describe("x-bound: contenteditable", () => {
    test("innerHTML", html`
        <div x-data="{ innerHTML: '<h1>Sample</h1>' }">
            <pre contenteditable &innerHTML></pre>
            <button @click="innerHTML='Hello!'">Click</button>
            <span x-format>{{ innerHTML }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "<h1>Sample</h1>")
        get("button").click();
        get("span").should("contain.text", "Hello!")
        get("pre").clear().type("Hello World!");
        get("span").should("contain.text", "Hello World!")
    });

    test("innerHTML (initliaze from element when property is null)", html`
        <div x-data="{ innerHTML: null }">
            <pre contenteditable &innerHTML>Hello!</pre>
            <span x-format>{{ innerHTML }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "Hello!")
    });

    test("innerText", html`
        <div x-data="{ innerText: 'Sample' }">
            <pre contenteditable &innerText></pre>
            <button @click="innerText='Hello!'">Click</button>
            <span x-format>{{ innerText }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "Sample")
        get("button").click();
        get("span").should("contain.text", "Hello!")
        get("pre").clear().type("Hello World!");
        get("span").should("contain.text", "Hello World!")
    });

    test("innerText (initliaze from element when property is null)", html`
        <div x-data="{ innerText: null }">
            <pre contenteditable &innerText>Hello!</pre>
            <span x-format>{{ innerText }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "Hello!")
    });

    test("textContent", html`
        <div x-data="{ textContent: 'Sample' }">
            <pre contenteditable &textContent></pre>
            <button @click="textContent='Hello!'">Click</button>
            <span x-format>{{ textContent }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "Sample")
        get("button").click();
        get("span").should("contain.text", "Hello!")
        get("pre").clear().type("Hello World!");
        get("span").should("contain.text", "Hello World!")
    });

    test("textContent (initliaze from element when property is null)", html`
        <div x-data="{ textContent: null }">
            <pre contenteditable &textContent>Hello!</pre>
            <span x-format>{{ textContent }}</pre>
        </div>`, ({ get }) => {

        get("span").should("contain.text", "Hello!")
    });
});

describe("x-bound: details", () => {
    test("details", html`
        <div x-data="{ open: true }">
            <details &open>
                <summary>Header</summary>
                Hello World!
            </details>
            <button @click="open = false">Toggle</button>
            <span x-format>{{ open }}</span>
        </div>`, ({ get }) => {

        get("details").should("have.attr", "open", "open");
        get("span").should("have.text", "true");

        get("button").click();
        get("details").should("not.have.attr", "open");
        get("span").should("have.text", "false");

        get("details").click();
        get("details").should("have.attr", "open", "open");
        get("span").should("have.text", "true");
    });

    test("initiaize from element when property is null", html`
        <div x-data="{ open: null }">
            <details &open open>
                <summary>Header</summary>
                Hello World!
            </details>
            <span x-format>{{ open }}</span>
        </div>`, ({ get }) => {

        get("details").should("have.attr", "open", "open");
        get("span").should("have.text", "true");
    });

    test("initiaize from element when property is undefined", html`
        <div x-data="{ open: undefined }">
            <details &open open>
                <summary>Header</summary>
                Hello World!
            </details>
            <span x-format>{{ open }}</span>
        </div>`, ({ get }) => {

        get("details").should("have.attr", "open", "open");
        get("span").should("have.text", "true");
    });
});

describe("x-bound: group", () => {
    test("radio", html`
        <div x-data="{ value: 2 }">
            <label><input type="radio" &group="value" value="1" /> 1</label>
            <label><input type="radio" &group="value" value="2" /> 2</label>
            <label><input type="radio" &group="value" value="3" /> 3</label>
            <button @click="value = '3'">Select 3</button>
            <span x-format>{{ value }}</span>
        </div>`, ({ get }) => {

        get("input[value=1]").should("not.be.checked");
        get("input[value=2]").should("be.checked");
        get("input[value=3]").should("not.be.checked");

        get("button").click();
        get("input[value=1]").should("not.be.checked");
        get("input[value=2]").should("not.be.checked");
        get("input[value=3]").should("be.checked");
        get("span").should("have.text", "3");
    });

    test("checkbox", html`
        <div x-data="{ value: 2 }">
            <label><input type="checkbox" &group="value" value="1" /> 1</label>
            <label><input type="checkbox" &group="value" value="2" /> 2</label>
            <label><input type="checkbox" &group="value" value="3" /> 3</label>
            <button @click="value = [1,3]">Select 1 and 3</button>
            <span x-format>{{ JSON.stringify(value) }}</span>
        </div>`, ({ get }) => {

        get("input[value=1]").should("not.be.checked");
        get("input[value=2]").should("be.checked");
        get("input[value=3]").should("not.be.checked");

        get("button").click();
        get("input[value=1]").should("be.checked");
        get("input[value=2]").should("not.be.checked");
        get("input[value=3]").should("be.checked");
        get("span").should("have.text", "[1,3]");

        get("input[value=1]").uncheck();
        get("input[value=2]").uncheck();
        get("input[value=3]").uncheck();
        get("span").should("have.text", "[]");

        get("input[value=2]").check();
        get("span").should("have.text", '["2"]');

        get("input[value=1]").check();
        get("span").should("have.text", '["2","1"]');
    });
});

describe("x-bound: dimensions", () => {
    test("clientWidth & clientHeight, offsetWidth & offsetHeight", html`
        <div x-data="{ cw: 0, ch: 0, ow: 0, oh: 0, size: '10px', text: 'Text' }">
            <input &value="text" />
            <div &clientWidth="cw" &clientHeight="ch" &offsetWidth="ow" &offsetHeight="oh" style="display: inline-block">
                <span x-format style="font-size: {{ size }}">{{ text }}</span>
            </div>
            <button @click="size = '150px'">Change size</button>
            <pre x-format>{{ cw }},{{ ch }},{{ ow }},{{ oh }}</pre>
        </div>`, ({ get }) => {

        get("pre").contains(/^\d{2},\d{2},\d{2},\d{2}$/);
        get("button").click();
        get("pre").contains(/^\d{3},\d{3},\d{3},\d{3}$/);
    });

    test("naturalWidth & naturalHeight", html`
        <div x-data="{ w: 0, h: 0 }" x-interpolate>
            <img &naturalWidth="w" &naturalHeight="h" width="250" src="https://live.mdnplay.dev/en-US/docs/Web/HTML/Element/img/clock-demo-400px.png" />
            <pre x-format>{{ w }},{{ h }}</pre>
        </div>`, ({ get }) => {

        get("pre").contains(/^400,398$/);
    });

    test("videoWidth & videoHeight", html`
        <div x-data="{ w: 0, h: 0 }" x-interpolate>
            <video
                &videoWidth="w"
                &videoHeight="h"
                width="350"
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls></video>
            <pre x-format>{{ w }},{{ h }}</pre>
        </div>`, ({ get }) => {

        get("pre").contains(/^320,176$/);
    });
});

describe("x-bound: component", () => {
    test("modifier: in", html`
        <div x-data="{ source: '1' }">
            <span id="s1" x-format>{{ source }}</span>
            <button id="b1" @click="source = '2'">Change source</button>

            <div x-data="{ target: '0' }" &target.in="source">
                <span id="s2" x-format>{{ target }}</span>
                <button id="b2" @click="target = '3'">Change target</button>
            </div>
        </div>`, ({ get }) => {

        get("#s1").should("have.text", "1");
        get("#s2").should("have.text", "1");

        get("#b1").click();
        get("#s1").should("have.text", "2");
        get("#s2").should("have.text", "2");

        get("#b2").click();
        get("#s1").should("have.text", "2");
        get("#s2").should("have.text", "3");
    });

    test("modifier: out", html`
        <div x-data="{ source: '1' }">
            <span id="s1" x-format>{{ source }}</span>
            <button id="b1" @click="source = '2'">Change source</button>

            <div x-data="{ target: '0' }" &target.out="source">
                <span id="s2" x-format>{{ target }}</span>
                <button id="b2" @click="target = '3'">Change target</button>
            </div>
        </div>`, ({ get }) => {

        get("#s1").should("have.text", "0");
        get("#s2").should("have.text", "0");

        get("#b1").click();
        get("#s1").should("have.text", "2");
        get("#s2").should("have.text", "0");

        get("#b2").click();
        get("#s1").should("have.text", "3");
        get("#s2").should("have.text", "3");
    });

    test("modifier: inout", html`
        <div x-data="{ source: '1' }">
            <span id="s1" x-format>{{ source }}</span>
            <button id="b1" @click="source = '2'">Change source</button>

            <div x-data="{ target: '0' }" &target.inout="source">
                <span id="s2" x-format>{{ target }}</span>
                <button id="b2" @click="target = '3'">Change target</button>
            </div>
        </div>`, ({ get }) => {

        get("#s1").should("have.text", "1");
        get("#s2").should("have.text", "1");

        get("#b1").click();
        get("#s1").should("have.text", "2");
        get("#s2").should("have.text", "2");

        get("#b2").click();
        get("#s1").should("have.text", "3");
        get("#s2").should("have.text", "3");
    });

    test("default modifier: inout", html`
        <div x-data="{ source: '1' }">
            <span id="s1" x-format>{{ source }}</span>
            <button id="b1" @click="source = '2'">Change source</button>

            <div x-data="{ target: '0' }" &target="source">
                <span id="s2" x-format>{{ target }}</span>
                <button id="b2" @click="target = '3'">Change target</button>
            </div>
        </div>`, ({ get }) => {

        get("#s1").should("have.text", "1");
        get("#s2").should("have.text", "1");

        get("#b1").click();
        get("#s1").should("have.text", "2");
        get("#s2").should("have.text", "2");

        get("#b2").click();
        get("#s1").should("have.text", "3");
        get("#s2").should("have.text", "3");
    });
});
