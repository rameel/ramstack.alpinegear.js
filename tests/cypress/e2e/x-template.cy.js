import { html, test } from "../utils";

test("x-template", html`
    <template id="tpl">
        <template x-if="show">
            <span x-format>{{ value }}</span>
        </template>
    </template>
    <div x-data="{ value: 'Foo', show: true }">
        <div x-template="tpl"></div>
    </div>`, ({ get }) => {

    get("span").should("have.text", "Foo");
});
