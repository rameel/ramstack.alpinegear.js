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

test("x-format: context aware", html`
    <div x-data x-format>
        <span id="id_1">{{ $el.id }}</span>
        <span id="id_2">{{ $el.id }}<span id="id_3" title="{{ $el.id }}"><span id="id_4">{{ $el.id }}</span></span></span>
    </div>
`, ({ get }) => {

    get("#id_1").should("contain.text", "id_1");
    get("#id_2").should("contain.text", "id_2id_4");
    get("#id_4").should("contain.text", "id_4");
    get("#id_3").should("have.attr", "title").and("eq", "id_3");
});
