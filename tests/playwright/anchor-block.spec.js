import { expect, test } from "@playwright/test";
import { set_html } from "./assets/utils";

for (const directive of ["fragment", "when", "match"]) {
    test(`anchor block: nested cleanup (${directive})`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        const content = `
            Before
            <dt x-data="{
                destroy() {
                    window.trace.destroy.push('dt')
                }
            }">Term</dt>
            <template x-fragment>
                <dd x-data="{ destroy() { window.trace.destroy.push('dd') } }"
                    x-effect="window.trace.effects.push(tick)"
                    @cleanup-probe.window="window.trace.events++">
                    Description
                </dd>
                <!-- Nested comment -->
                After
            </template>`;

        const block = directive === "match"
            ? `<template id="block" x-match><template x-case="true">${content}</template></template>`
            : `<template id="block" x-${directive}="true">${content}</template>`;

        await set_html(page, `
            <div x-data="{ tick: 0 }" id="app"
                 x-init="window.trace = { destroy: [], effects: [], events: 0 }">
                <dl id="content">${block}</dl>
            </div>`);

        await expect(page.locator("dt, dd")).toHaveText(["Term", "Description"]);

        await page.evaluate(async () => {
            Alpine.$data(document.querySelector("#app")).tick = 1;
            window.dispatchEvent(new Event("cleanup-probe"));
            await Alpine.nextTick();
        });

        expect(await page.evaluate(() => window.trace)).toEqual({
            destroy: [],
            effects: [0, 1],
            events: 1
        });

        // Alpine 3.14.2+ cleans x-if/x-for clones with its observer disconnected
        await page.evaluate(async () => {
            const anchor = document.querySelector("#block");

            Alpine.mutateDom(() => {
                Alpine.destroyTree(anchor);
                anchor.remove();
            });

            await Alpine.nextTick();
        });

        // Include text, comments and nested anchors, not just visible elements
        expect(await page.locator("#content").evaluate(el => el.childNodes.length)).toBe(0);
        expect(await page.evaluate(() => window.trace.destroy.toSorted())).toEqual(["dd", "dt"]);

        await page.evaluate(async () => {
            Alpine.$data(document.querySelector("#app")).tick = 2;
            window.dispatchEvent(new Event("cleanup-probe"));
            await Alpine.nextTick();
        });

        expect(await page.evaluate(() => ({ ...window.trace, destroy: window.trace.destroy.toSorted() }))).toEqual({
            destroy: ["dd", "dt"],
            effects: [0, 1],
            events: 1
        });

        expect(errors).toEqual([]);
    });
}

const permutations = items => items.length
    ? items.flatMap((item, i) => permutations(items.filter((_, j) => i !== j)).map(rest => [item, ...rest]))
    : [[]];

// Child nodes of the element, including templates, text and comments
const layout = locator => locator.evaluate(el => [...el.childNodes]
    .filter(node => node.nodeType !== Node.TEXT_NODE || node.textContent.trim())
    .map(node => node.nodeName + ":" + (node.nodeName === "TEMPLATE" ? "" : node.textContent.trim())));

for (const directive of ["fragment", "when", "match"]) {
    test(`anchor block: keyed x-for reordering (${directive})`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        const content = `[<dt x-text="n"></dt><!--pair--><dd x-text="n"></dd>]`;
        const block = {
            fragment: `<template x-fragment>${content}</template>`,
            when: `<template x-when="show">${content}</template>`,
            match: `<template x-match><template x-case="show">${content}</template></template>`
        }[directive];

        await set_html(page, `<dl id="block" x-data="{ items: [1, 2, 3, 4], show: true }"><template x-for="n in items" :key="n">${block}</template></dl>`);
        await expect(page.locator("dt")).toHaveCount(4);

        const orders = permutations([1, 2, 3, 4]);
        const states = [
            // Adding, removing and toggling the content
            ...[[1, 2, 3], [3, 2, 1], [3, 2, 1, 4], [3, 5, 2, 1, 4], [5, 1], [], [2, 5, 3, 1]].map(items => ({ items, show: true })),
            ...(directive === "fragment" ? [] : [false, true, false, true].map(show => ({ items: [1, 3, 5, 2], show })))
        ];

        const result = await page.locator("#block").evaluate(async (block, { orders, states, transitions }) => {
            const data = Alpine.$data(block);
            const terms = new Map([...block.querySelectorAll("dt")].map(dt => [dt.textContent, dt]));

            const check = async ({ items, show = true }, same_nodes) => {
                data.items = items;
                data.show = show;
                await Alpine.nextTick();

                // Like x-if, a block renders its content right after its template
                const actual = [...block.childNodes].map(node => node.nodeName + ":" + (node.nodeName === "TEMPLATE" ? "" : node.textContent));
                const expected = ["TEMPLATE:", ...items.flatMap(n => show
                    ? ["TEMPLATE:", "#text:[", `DT:${n}`, "#comment:pair", `DD:${n}`, "#text:]"]
                    : ["TEMPLATE:"])];

                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(JSON.stringify({ items, show, actual, expected }));
                }

                if (same_nodes && [...block.querySelectorAll("dt")].some(dt => terms.get(dt.textContent) !== dt)) {
                    throw new Error(`Reordering must move the existing nodes: ${items}`);
                }
            };

            let count = 0;
            for (const from of orders) {
                for (const to of transitions ? orders : [from]) {
                    await check({ items: from }, true);
                    await check({ items: to }, true);
                    count++;
                }
            }

            for (const state of states) {
                await check(state, null);
            }

            // Restoring the order must settle rather than trigger an observer feedback loop
            let mutations = 0;
            const observer = new MutationObserver(records => mutations += records.length);
            observer.observe(block, { childList: true });
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            observer.disconnect();

            return { count, mutations };
        }, { orders, states, transitions: directive === "fragment" });

        // All transitions between the orders of four items for x-fragment
        expect(result).toEqual({ count: directive === "fragment" ? 576 : 24, mutations: 0 });
        expect(errors).toEqual([]);
    });
}

for (const [name, html, item] of [
    [
        "nested blocks",
        `<template x-fragment>[<span x-text="n"></span><template x-fragment>(<i x-text="n"></i><template x-when="show">{<b x-text="n"></b>}</template>)</template>]</template>`,
        (n, show) => ["[", `SPAN:${n}`, "(", `I:${n}`, ...(show ? ["{", `B:${n}`, "}"] : []), ")", "]"]
    ],
    [
        "x-if inside a block",
        `<template x-fragment>[<dt x-text="n"></dt><template x-if="show"><dd x-text="n"></dd></template>]</template>`,
        (n, show) => ["[", `DT:${n}`, ...(show ? [`DD:${n}`] : []), "]"]
    ],
    [
        "block inside x-if inside a block",
        `<template x-fragment>[<template x-if="show"><template x-fragment><b x-text="n"></b>-<i x-text="n"></i></template></template>]</template>`,
        (n, show) => ["[", ...(show ? [`B:${n}`, "-", `I:${n}`] : []), "]"]
    ],
    [
        "block inside x-if",
        `<template x-if="show"><template x-fragment>[<dt x-text="n"></dt><dd x-text="n"></dd>]</template></template>`,
        (n, show) => show ? ["[", `DT:${n}`, `DD:${n}`, "]"] : []
    ]
]) {
    test(`anchor block: keyed x-for reordering with ${name}`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        await set_html(page, `
            <div id="block" x-data="{ items: [1, 2, 3, 4], show: true }">
                <p>Before</p>
                <template x-for="n in items" :key="n">
                    ${html}
                </template>
                <p>After</p>
            </div>`);

        const states = [
            ...permutations([1, 2, 3, 4]).map(items => ({ items, show: true })),
            ...[[1, 2, 3], [3, 2, 1, 4], [3, 5, 2, 1, 4], [5, 1], [], [2, 5, 3, 1]].map(items => ({ items, show: true })),
            ...[[1, 3, 5, 2], [2, 5, 3, 1], [2, 5, 3, 1], [5, 1, 2, 3]].map((items, i) => ({ items, show: i % 2 === 1 }))
        ];

        for (const { items, show } of [{ items: [1, 2, 3, 4], show: true }, ...states]) {
            await page.locator("#block").evaluate(async (block, { items, show }) => {
                Object.assign(Alpine.$data(block), { items, show });
                await Alpine.nextTick();
            }, { items, show });

            const actual = (await layout(page.locator("#block"))).filter(token => token !== "TEMPLATE:").map(token => token.replace(/^#text:/, ""));
            expect(actual, JSON.stringify({ items, show })).toEqual(["P:Before", ...items.flatMap(n => item(n, show)), "P:After"]);
        }

        expect(errors).toEqual([]);
    });
}

test("anchor block: block containing keyed x-for of blocks", async ({ page }) => {
    await set_html(page, `<div id="block" x-data="{ items: [1, 2, 3, 4] }"><template x-fragment><h2>Title</h2><template x-for="n in items" :key="n"><template x-fragment>[<dt x-text="n"></dt><dd x-text="n"></dd>]</template></template><footer>Footer</footer></template></div>`);
    await expect(page.locator("#block")).toHaveText("Title[11][22][33][44]Footer");

    for (const items of [...permutations([1, 2, 3, 4]), [3, 2, 1], [2, 3, 1, 4], [4, 1], [], [1, 2, 3], [5, 1, 6, 2, 3], [2, 6, 7, 3]]) {
        await page.evaluate(items => Alpine.$data(document.querySelector("#block")).items = items, items);
        await expect(page.locator("#block")).toHaveText(`Title${items.map(n => `[${n}${n}]`).join("")}Footer`);
    }
});

for (const [name, block, { ends = false, removes = true } = {}] of [
    ["containing keyed x-for of elements", list => `<h2 x-text="o"></h2>${list(`<b x-text="'[' + o + '-' + n + ']'"></b>`)}<footer>F</footer>`],
    ["containing keyed x-for of blocks", list => `<h2 x-text="o"></h2>${list(`<template x-fragment>[<dt x-text="o"></dt>-<dd x-text="n"></dd>]</template>`)}<footer>F</footer>`],
    // Alpine before 3.14.2 leaves the x-for items behind when the block is removed
    ["containing x-if of keyed x-for", list => `<h2 x-text="o"></h2><template x-if="true">${list(`<b x-text="'[' + o + '-' + n + ']'"></b>`)}</template><footer>F</footer>`, { removes: false }],
    ["ending with keyed x-for of elements", list => `<h2 x-text="o"></h2><footer>F</footer>${list(`<b x-text="'[' + o + '-' + n + ']'"></b>`)}`, { ends: true }],
    ["ending with keyed x-for of blocks", list => `<h2 x-text="o"></h2><footer>F</footer>${list(`<template x-fragment>[<dt x-text="o"></dt>-<dd x-text="n"></dd>]</template>`)}`, { ends: true }],
    ["ending with x-if", () => `<h2 x-text="o"></h2><footer>F</footer><template x-if="true"><i x-text="inner[o].map(n => '[' + o + '-' + n + ']').join('')"></i></template>`, { ends: true }]
]) {
    test(`anchor block: keyed x-for of blocks ${name}`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        const inner = lists => Object.fromEntries([1, 2, 3, 4, 5].map((o, i) => [o, lists[i] ?? [1, 2]]));
        const text = ({ outer, inner }) => outer.map(o => {
            const items = inner[o].map(n => `[${o}-${n}]`).join("");
            return ends ? `${o}F${items}` : `${o}${items}F`;
        }).join("");

        let state = { outer: [1, 2, 3, 4], inner: inner([]) };
        await set_html(page, `
            <div id="block" x-data='${JSON.stringify(state)}'>
                <template x-for="o in outer" :key="o">
                    <template x-fragment>${block(item => `<template x-for="n in inner[o]" :key="n">${item}</template>`)}</template>
                </template><p>After</p>
            </div>`);
        await expect(page.locator("#block")).toHaveText(text(state) + "After");

        for (const change of [
            // Alpine 3.15+ moves the nested items apart even when the order stays the same
            ...permutations([1, 2, 3, 4]).map(outer => ({ outer })),

            // Alpine 3.15+ lists the added items last in x-for lookup
            { inner: inner([[0, 1, 2], [1, 0, 2], [1, 2, 0], [2, 1]]) },
            { outer: [4, 3, 2, 1] },
            { outer: [2, 4, 1, 3] },

            // Nested x-for runs together with the outer one. Alpine 3.15 runs them in the order
            // of the changes, 3.16+ always runs the outer one first, which leaves the blocks
            // scattered for the nested one.
            { inner: inner([[3, 0, 1, 2], [1, 4, 0], [5, 2, 6, 1, 0], [2, 1]]), outer: [3, 1, 4, 2] },
            { inner: inner([[2, 3, 0], [1, 4, 7, 0], [6, 1, 0, 2], [8, 2, 1]]), outer: [1, 3, 2, 4] },
            { outer: [4, 2, 1, 3], inner: inner([[0, 2, 9, 3], [4, 1], [6, 5, 1, 2], [2, 3, 1, 8]]) },
            { outer: [2, 1, 3, 4], inner: inner([[9, 0, 3], [1, 7, 4], [6, 2, 5, 1], [8, 3, 2, 1]]) },

            // Adding and removing the blocks
            ...removes ? [
                { outer: [3, 5, 1] },
                { inner: inner([[1, 3], [], [0, 6, 1], [], [4, 3, 5]]), outer: [5, 1, 3, 2] },
                { outer: [2, 3] },
                { outer: [] },
                { outer: [4, 2, 5] },

                // With a single block, moving its last node after the template may be all x-for does
                { outer: [5] },
                { outer: [5] }
            ] : []
        ]) {
            state = { ...state, ...change };

            await page.evaluate(change => Object.assign(Alpine.$data(document.querySelector("#block")), change), change);
            await expect(page.locator("#block"), JSON.stringify(change)).toHaveText(text(state) + "After");
        }

        expect(errors).toEqual([]);
    });
}

for (const type of ["element", "text", "comment"]) {
    test(`anchor block: restores moved ${type} with a stationary anchor`, async ({ page }) => {
        await set_html(page, `<dl id="block" x-data><template x-fragment>before<!--marker--><dt>Term</dt>between<dd>Description</dd>after</template></dl>`);
        await expect(page.locator("dt")).toHaveText("Term");

        const moved = await page.locator("#block").evaluateHandle((block, type) => {
            const nodeType = { element: Node.ELEMENT_NODE, text: Node.TEXT_NODE, comment: Node.COMMENT_NODE }[type];
            const node = [...block.childNodes].find(node => node.nodeType === nodeType && node.nodeName !== "TEMPLATE");
            block.append(node);
            return node;
        }, type);

        await expect.poll(() => layout(page.locator("#block"))).toEqual([
            "TEMPLATE:", "#text:before", "#comment:marker", "DT:Term", "#text:between", "DD:Description", "#text:after"
        ]);
        expect(await moved.evaluate(node => node.parentNode.id)).toBe("block");
    });
}

for (const [directive, content, expected] of [
    ["x-if", `<template x-if="true"><b>Content</b></template>`, "[Content]"],
    ["x-for", `<template x-for="n in [1, 2, 3]"><b x-text="n"></b></template>`, "[123]"]
]) {
    test(`anchor block: preserves initial ${directive} content`, async ({ page }) => {
        await set_html(page, `<div id="block" x-data><template x-fragment>[${content}]</template></div>`);
        await expect(page.locator("#block")).toHaveText(expected);
    });
}
