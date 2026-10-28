import { expect, test } from "@playwright/test";
import { set_data, set_html } from "./assets/utils";

// Wraps the content in each directive built on anchor_block
const blocks = {
    "x-fragment": content => `<template x-fragment>${content}</template>`,
    "x-when": content => `<template x-when="show">${content}</template>`,
    "x-match": content => `<template x-match><template x-case="show">${content}</template></template>`
};

const permutations = items => items.length
    ? items.flatMap((item, i) => permutations(items.filter((_, j) => i !== j)).map(rest => [item, ...rest]))
    : [[]];

// Child nodes of the element as HTML, including templates, text and comments.
// Templates are shown without their content and elements with their text only.
const layout = locator => locator.evaluate(el => [...el.childNodes].map(node => {
    const tag = node.nodeName.toLowerCase();

    return node.nodeType === Node.TEXT_NODE ? node.data
        : node.nodeType === Node.COMMENT_NODE ? `<!--${node.data}-->`
        : tag === "template" ? "<template>"
        : `<${tag}>${node.textContent}</${tag}>`;
}).join(""));

for (const [directive, block] of Object.entries(blocks)) {
    test(`anchor block: nested cleanup (${directive})`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        await set_html(page, `
            <div x-data="{ show: true, tick: 0 }" x-init="window.trace = { destroyed: [], effects: [], events: 0 }">
                <dl>
                    ${block(`
                        Before
                        <dt x-data="{ destroy() { trace.destroyed.push('dt') } }">Term</dt>
                        <template x-fragment>
                            <dd x-data="{ destroy() { trace.destroyed.push('dd') } }"
                                x-effect="trace.effects.push(tick)"
                                @probe.window="trace.events++">Description</dd>
                            <!--comment-->
                            After
                        </template>`)}
                </dl>
            </div>`, { trim: true });

        // Triggers the effect and the event listener
        const probe = tick => page.evaluate(async tick => {
            Alpine.$data(document.querySelector("div")).tick = tick;
            window.dispatchEvent(new Event("probe"));
            await Alpine.nextTick();

            return { ...trace, destroyed: trace.destroyed.toSorted() };
        }, tick);

        await expect(page.locator("dt, dd")).toHaveText(["Term", "Description"]);
        expect(await probe(1)).toEqual({ destroyed: [], effects: [0, 1], events: 1 });

        // Alpine removes x-if and x-for clones this way, with its observer paused
        await page.evaluate(() => Alpine.mutateDom(() => {
            const anchor = document.querySelector("dl > template");
            Alpine.destroyTree(anchor);
            anchor.remove();
        }));

        // Including the text, comments and nested anchors
        expect(await layout(page.locator("dl"))).toBe("");
        expect(await probe(2)).toEqual({ destroyed: ["dd", "dt"], effects: [0, 1], events: 1 });
        expect(errors).toEqual([]);
    });
}

test("anchor block: removes nested x-if and x-for content", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ show: true }">
            <template x-when="show">
                <template x-if="true">
                    <template x-for="n in [1, 2]"><b x-text="n"></b></template>
                </template>
                <template x-for="n in [3, 4]">
                    <template x-if="true"><i x-text="n"></i></template>
                </template>
            </template>
        </div>`);

    await expect(page.locator("b, i")).toHaveText(["1", "2", "3", "4"]);

    await set_data(page.locator("div"), { show: false });
    await expect(page.locator("b, i")).toHaveCount(0);
});

test("anchor block: keyed x-for reordering (x-fragment)", async ({ page }) => {
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));

    await set_html(page, `
        <dl x-data="{ items: [1, 2, 3, 4] }">
            <template x-for="n in items" :key="n">
                <template x-fragment>[<dt x-text="n"></dt><!--pair--><dd x-text="n"></dd>]</template>
            </template>
        </dl>`, { trim: true });

    // Like x-if, a block renders its content right after its template
    const expected = items => "<template>" + items
        .map(n => `<template>[<dt>${n}</dt><!--pair--><dd>${n}</dd>]`)
        .join("");

    const dl = page.locator("dl");

    // Marks the nodes to tell later whether reordering moved or recreated them
    await dl.evaluate(dl => dl.childNodes.forEach(node => node.original = true));

    // All transitions between the orders of four items
    for (const from of permutations([1, 2, 3, 4])) {
        for (const to of permutations([1, 2, 3, 4])) {
            await set_data(dl, { items: from });
            await set_data(dl, { items: to });
            expect(await layout(dl), `${from} → ${to}`).toBe(expected(to));
        }
    }

    expect(await dl.evaluate(dl => [...dl.childNodes].every(node => node.original))).toBe(true);

    // Adding and removing the items
    for (const items of [[1, 2, 3], [3, 2, 1], [3, 2, 1, 4], [3, 5, 2, 1, 4], [5, 1], [], [2, 5, 3, 1]]) {
        await set_data(dl, { items });
        expect(await layout(dl), `${items}`).toBe(expected(items));
    }

    // Restoring the order settles rather than triggers an observer feedback loop
    const mutations = await dl.evaluate(dl => new Promise(resolve => {
        let count = 0;
        const observer = new MutationObserver(records => count += records.length);
        observer.observe(dl, { childList: true });

        requestAnimationFrame(() => requestAnimationFrame(() => {
            observer.disconnect();
            resolve(count);
        }));
    }));

    expect(mutations).toBe(0);
    expect(errors).toEqual([]);
});

// x-when and x-match render the same block as x-fragment, so a single pass
// over the orders is enough here, along with hiding and showing the content
for (const directive of ["x-when", "x-match"]) {
    test(`anchor block: keyed x-for reordering (${directive})`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", e => errors.push(e.message));

        await set_html(page, `
            <dl x-data="{ items: [1, 2, 3, 4], show: true }">
                <template x-for="n in items" :key="n">
                    ${blocks[directive](`[<dt x-text="n"></dt><!--pair--><dd x-text="n"></dd>]`)}
                </template>
            </dl>`, { trim: true });

        const expected = (items, show) => "<template>" + items
            .map(n => show ? `<template>[<dt>${n}</dt><!--pair--><dd>${n}</dd>]` : "<template>")
            .join("");

        const dl = page.locator("dl");

        for (const [items, show] of [
            ...permutations([1, 2, 3, 4]).map(items => [items, true]),

            // Adding and removing the items
            ...[[1, 2, 3], [3, 2, 1], [3, 2, 1, 4], [3, 5, 2, 1, 4], [5, 1], [], [2, 5, 3, 1]].map(items => [items, true]),

            // Hiding and showing the content
            ...[false, true, false, true].map(show => [[1, 3, 5, 2], show])
        ]) {
            await set_data(dl, { items, show });
            expect(await layout(dl), `${items}, show: ${show}`).toBe(expected(items, show));
        }

        expect(errors).toEqual([]);
    });
}

test("anchor block: block containing keyed x-for of blocks", async ({ page }) => {
    await set_html(page, `
        <div x-data="{ items: [1, 2, 3, 4] }">
            <template x-fragment>
                <h2>Title</h2>
                <template x-for="n in items" :key="n">
                    <template x-fragment>[<dt x-text="n"></dt><dd x-text="n"></dd>]</template>
                </template>
                <footer>Footer</footer>
            </template>
        </div>`, { trim: true });

    await expect(page.locator("div")).toHaveText("Title[11][22][33][44]Footer");

    for (const items of [...permutations([1, 2, 3, 4]), [3, 2, 1], [2, 3, 1, 4], [4, 1], [], [1, 2, 3], [5, 1, 6, 2, 3], [2, 6, 7, 3]]) {
        await set_data(page.locator("div"), { items });
        await expect(page.locator("div")).toHaveText(`Title${items.map(n => `[${n}${n}]`).join("")}Footer`);
    }
});

test("anchor block: restores moved nodes with a stationary anchor", async ({ page }) => {
    await set_html(page, `
        <dl x-data>
            <template x-fragment>
                before
                <!--marker-->
                <dt>Term</dt>
                between
                <dd>Description</dd>
                after
            </template>
        </dl>`, { trim: true });

    const dl = page.locator("dl");
    const expected = "<template>before<!--marker--><dt>Term</dt>between<dd>Description</dd>after";
    await expect.poll(() => layout(dl)).toBe(expected);

    // An element, a text and a comment moved to the end are brought back
    for (const text of ["Term", "between", "marker"]) {
        await dl.evaluate((dl, text) => dl.append([...dl.childNodes].find(node => node.textContent === text)), text);
        await expect.poll(() => layout(dl), text).toBe(expected);
    }
});

test("anchor block: preserves initial x-if and x-for content", async ({ page }) => {
    await set_html(page, `
        <div x-data>
            <template x-fragment>
                [
                <template x-if="true"><b>Content</b></template>
                |
                <template x-for="n in [1, 2, 3]"><i x-text="n"></i></template>
                ]
            </template>
        </div>`, { trim: true });

    await expect(page.locator("div")).toHaveText("[Content|123]");
});

// Like Alpine with nested templates in x-for items (alpinejs/alpine#4911), keyed x-for
// does not keep in order the content of the templates placed directly in a block,
// or of a block in x-if. Expected to pass once Alpine includes alpinejs/alpine#4912.
for (const [name, item] of [
    ["a block in a block", `
        <template x-fragment>
            [<b x-text="n"></b>
            <template x-fragment><i x-text="n"></i></template>]
        </template>`],
    ["x-if in a block", `
        <template x-fragment>
            [<b x-text="n"></b>
            <template x-if="true"><i x-text="n"></i></template>]
        </template>`],
    ["x-for in a block", `
        <template x-fragment>
            [<b x-text="n"></b>
            <template x-for="i in [n]"><i x-text="i"></i></template>]
        </template>`],
    ["a block in x-if", `
        <template x-if="true">
            <template x-fragment>[<b x-text="n"></b><i x-text="n"></i>]</template>
        </template>`]
]) {
    test.fail(`anchor block: keyed x-for reordering with ${name}`, async ({ page }) => {
        await set_html(page, `
            <div x-data="{ items: [1, 2, 3] }">
                <template x-for="n in items" :key="n">${item}</template>
            </div>`, { trim: true });

        await set_data(page.locator("div"), { items: [3, 2, 1] });
        expect(await page.locator("div").textContent()).toBe("[33][22][11]");

        await set_data(page.locator("div"), { items: [3, 4, 2, 1] });
        expect(await page.locator("div").textContent()).toBe("[33][44][22][11]");
    });
}
