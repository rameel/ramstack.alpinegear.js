import { html, test } from "../utils";

test("x-when", html`
    <div x-data="{ show: false }">
        <button @click="show = !show">Toggle</button>
        <template x-when="show">
            Header
            <h1>Toggle Me</h1>
            Footer
        </template>
    </div>`, ({ get }) => {

    get("div").should("not.contain.text", "Header");
    get("h1").should("not.exist");
    get("div").should("not.contain.text", "Footer");

    get("button").click();

    get("div").should("contain.text", "Header");
    get("h1").should("exist");
    get("div").should("contain.text", "Footer");

    get("button").click();
    get("div").should("not.contain.text", "Header");
    get("h1").should("not.exist");
    get("div").should("not.contain.text", "Footer");
});

test("x-when: x-ref", html`
    <div x-data>
        <template x-when="true">
            <ul x-ref="listbox" data-foo="bar">
                <li x-text="$refs.listbox.dataset.foo"></li>
            </ul>
        </template>
    </div>`, ({ get }) => {

    get("li").should("contain.text", "bar");
});

test("x-when: scope propogation", html`
    <div x-data="{ items: [{ id: 1, title: 'item' }] }">
        <template x-for="(item, index) in items">
            <template x-when="item.id > 0">
                <span x-text="'index:' + index + ', title:' + item.title"></span>
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div span").should("contain.text", "index:0, title:item");
});

test("x-when: x-for", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items">
            <template x-when="item.id > 0">[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});

test("x-when: x-for with key", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items" :key="item.id">
            <template x-when="item.id > 0">[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});
