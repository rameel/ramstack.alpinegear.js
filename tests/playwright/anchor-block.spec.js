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
