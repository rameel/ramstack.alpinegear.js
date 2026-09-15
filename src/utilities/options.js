import { is_array, warn } from "./utils";

export function parse_options(value, source, directive) {
    if (value) {
        try {
            const options = JSON.parse(value);
            if (options && typeof options === "object" && !is_array(options)) {
                return options;
            }
        }
        catch {
            // Report the same error for malformed JSON and unsupported JSON values
        }
    }

    value && warn(`x-${directive} options in '${source}' must be a valid JSON object`);
    return {};
}
