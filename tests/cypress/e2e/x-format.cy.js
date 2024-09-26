import { html, test } from "../utils";

test("x-format", html`
    <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
        [{{ name }},{{ title }}]
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[Foo,Bar]");
});

test("x-format: recursively", html`
    <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
        [<span>{{ name }}</span>,<span>{{ title }}</span>]
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[Foo,Bar]");
});

test("x-format: attributes", html`
    <div x-data="{ name: 'Foo', title: 'Bar' }" x-format>
        [<span title="({{ name }}:{{ title }})">{{ name }},{{ title }}</span>]
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[Foo,Bar]");
    get("span").should("have.attr", "title").and("eq", "(Foo:Bar)");
});
