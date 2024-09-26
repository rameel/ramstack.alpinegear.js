import { html, test } from "../utils";

test("x-match", html`
    <div x-data="{ value: 1 }">
        <button @click="value++">Increment</button>

        <template x-match>
            <template x-case="value == 1">1</template>
            <template x-case="value == 2">2</template>
            <template x-case="value == 3">3</template>
            <template x-default>Other</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "1");

    get("button").click();
    get("div").should("contain.text", "2");

    get("button").click();
    get("div").should("contain.text", "3");

    get("button").click();
    get("div").should("contain.text", "Other");
});

test("x-match: cleanup", html`
    <div x-data="{ value: 1 }">
        <button @click="value++">Increment</button>

        <template x-match>
            <template x-case="value == 1">1</template>
            <template x-case="value == 2">2</template>
            <template x-case="value == 3">3</template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "1");
    get("div").should("not.contain.text", "2");
    get("div").should("not.contain.text", "3");

    get("button").click();
    get("div").should("contain.text", "2");
    get("div").should("not.contain.text", "1");
    get("div").should("not.contain.text", "3");

    get("button").click();
    get("div").should("contain.text", "3");
    get("div").should("not.contain.text", "1");
    get("div").should("not.contain.text", "2");

    get("button").click();
    get("div").should("not.contain.text", "1");
    get("div").should("not.contain.text", "2");
    get("div").should("not.contain.text", "3");
});

test("x-match: scope propogation", html`
    <div x-data="{ items: [1,2,3,4] }">
        <template x-for="item in items">
            <template x-match>
                <template x-case="item == 1">[<span x-text="item"></span>]</template>
                <template x-case="item == 2">[<span x-text="item"></span>]</template>
                <template x-case="item == 3">[<span x-text="item"></span>]</template>
                <template x-default>[<span>Other</span>]</template>
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1][2][3][Other]");
});

test("x-match: non-template element on x-case arms", html`
    <div x-data="{ items: [1,2,3,4] }">
        <template x-for="item in items">
            <template x-match>
                <span x-case="item == 1">[<span x-text="item"></span>]</span>
                <span x-case="item == 2">[<span x-text="item"></span>]</span>
                <span x-case="item == 3">[<span x-text="item"></span>]</span>
                <span x-default>[<span>Other</span>]</span>
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1][2][3][Other]");
});

test("x-match: x-for", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items">
            <template x-match>
                <span x-case="item.id == 1">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                <span x-case="item.id == 2">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                <template x-default>[<span x-format>{{ item.id }}:{{ item.title }}</span>]</template>
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});

test("x-match: x-for with key", html`
    <div x-data="{ items: [{ id: 1, title: 'item-1' }, { id: 2, title: 'item-2' }, { id: 3, title: 'item-3' }] }">
        <div>
            <button @click="items.reverse()">Reverse</button>
        </div>
        <template x-for="item in items" :key="item.id">
            <template x-match>
                <span x-case="item.id == 1">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                <span x-case="item.id == 2">[<span x-format>{{ item.id }}:{{ item.title }}</span>]</span>
                <template x-default>[<span x-format>{{ item.id }}:{{ item.title }}</span>]</template>
            </template>
        </template>
    </div>`, ({ get }) => {

    get("div").should("contain.text", "[1:item-1][2:item-2][3:item-3]");

    get("button").click();

    get("div").should("contain.text", "[3:item-3][2:item-2][1:item-1]");
});
