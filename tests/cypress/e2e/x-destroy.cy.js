import { html, test } from "../utils";

test("x-destroy", html`
    <div x-data="{ value: 'Foo', show: true }">
        <span x-text="value"></span>
        <template x-when="show">
            <i x-destroy="value = 'Bar'"></i>
        </template>
        <button @click="show = false">Hide</button>
    </div>`, ({ get }) => {

    get("span").should("have.text", "Foo");
    get("button").click();
    get("span").should("have.text", "Bar");
});
