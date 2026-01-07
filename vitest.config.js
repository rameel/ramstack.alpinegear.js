import path from "path";
import {
    defineConfig
} from "vitest/config";

import {
    fileURLToPath
} from "url";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        include: ['tests/utilities/**/*.test.js']
    },
    resolve: {
        alias: {
            "@": path.join(path.dirname(fileURLToPath(import.meta.url)), "src")
        }
    }
});
