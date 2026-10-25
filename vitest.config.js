import path from "path";
import {
    defineConfig
} from "vitest/config";

import {
    fileURLToPath
} from "url";

export default defineConfig({
    define: {
        __DEV__: true,
        __IIFE__: false
    },
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
