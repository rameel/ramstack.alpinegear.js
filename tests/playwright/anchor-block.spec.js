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

    for (const items of [...permutations([1, 2, 3, 4]), [3, 2, 1], [2, 3, 1, 4], [4, 1], [], [1, 2, 3]]) {
        await page.evaluate(items => Alpine.$data(document.querySelector("#block")).items = items, items);
        await expect(page.locator("#block")).toHaveText(`Title${items.map(n => `[${n}${n}]`).join("")}Footer`);
    }
});

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
