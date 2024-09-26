import { html, test } from "../utils";

test("x-fragment", html`
    <div x-data="{ show: true }">
        <button @click="show = !show">Toggle</button>
        <template x-if="show">
            <template x-fragment>
                Before <span>Content</span> After
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "Before Content After");

    get("button").click();
    get("div").should("not.contain.text", "Before Content After");

    get("button").click();
    get("div").should("contain.text", "Before Content After");
});

test("x-fragment: scope propogation", html`
    <div x-data="{ items: [{ title: 'TITLE' }] }">
        <template x-for="item in items">
            <template x-fragment>
                Before <span x-format>[{{ item.title }}]</span> After
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "Before [TITLE] After");
});

test("x-fragment: x-for", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items">
            <template x-fragment>[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});

test("x-fragment: x-for with key", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items" :key="item.id">
            <template x-fragment>[<span x-text="item.id"></span>:<span x-text="item.title"></span>]</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});
