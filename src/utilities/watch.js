import { assert } from "@/utilities/utils";

export function watch(get_value, callback, options = null) {
    assert(Alpine, "Alpine is not defined.");

    const {
        effect,
        release
    } = Alpine;

    let new_value;
    let old_value;
    let initialized = false;

    const handle = effect(() => {
        new_value = get_value();

        if (!initialized) {
            options?.deep && JSON.stringify(new_value);
            old_value = new_value;
        }

        if (initialized || (options?.immediate ?? true)) {
            // Prevent the watcher from detecting its own dependencies.
            setTimeout(() => {
                callback(new_value, old_value);
                old_value = new_value;
            }, 0);
        }

        initialized = true;
    });

    return () => release(handle);
}
