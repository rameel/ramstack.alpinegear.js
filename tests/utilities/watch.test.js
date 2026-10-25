import { describe, expect, test } from "vitest";
import { watch } from "@/utilities/watch";
import Alpine from "alpinejs";

// watch takes Alpine from the global scope
globalThis.Alpine = Alpine;

// Lets Alpine run the scheduled effects, but not the timers the watcher sets
const flush_effects = () => new Promise(queueMicrotask);

// Lets the timers set so far fire; the effects must be flushed first,
// otherwise the timers they set would fire after this one
const flush_timers = () => new Promise(resolve => setTimeout(resolve));

describe("watch", () => {
    test("reports changes made before the callback once", async () => {
        const data = Alpine.reactive({ value: 0 });
        const tracing = [];

        watch(
            () => data.value,
            (value, old_value) => tracing.push([value, old_value]),
            { immediate: false });

        data.value = 1;
        await flush_effects();

        data.value = 2;
        await flush_effects();
        await flush_timers();

        expect(tracing).toEqual([[2, 0]]);
    });

    test("immediate: reports a change made before the first callback once", async () => {
        const data = Alpine.reactive({ value: 0 });
        const tracing = [];

        watch(
            () => data.value,
            (value, old_value) => tracing.push([value, old_value]));

        data.value = 1;
        await flush_effects();
        await flush_timers();

        expect(tracing).toEqual([[1, 0]]);
    });

    test("no callback after disposal", async () => {
        const data = Alpine.reactive({ value: 0 });
        const tracing = [];

        const dispose = watch(
            () => data.value,
            (value, old_value) => tracing.push([value, old_value]),
            { immediate: false });

        data.value = 1;
        await flush_effects();

        data.value = 2;
        await flush_effects();

        dispose();
        await flush_timers();

        expect(tracing).toEqual([]);
    });
});
