import path from "path";
import alias from "@rollup/plugin-alias";
import bundle_size from "rollup-plugin-bundle-size";
import replace from "@rollup/plugin-replace";
import node_resolve from "@rollup/plugin-node-resolve";
import strip_comments from "strip-comments";
import terser from "@rollup/plugin-terser";
import virtual from "@rollup/plugin-virtual";

import {
    globSync as glob
} from "glob";

import {
    fileURLToPath
} from "url";

const __SRC = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "src");

const is_production = process.env.NODE_ENV === "production";

const global_plugins = [
    node_resolve(),
    remove_comments(),
    trim_ws(),
    bundle_size(),
    alias({
        entries: [
            { find: "@", replacement: __SRC }
        ]
    })
];

const configurations = glob("src/plugins/*/index.js").map(p => {
    const plugin_name = path.basename(path.dirname(p));

    return [
        create_configuration({ plugin_name, input: `${plugin_name}.js`, format: "iife", optimize: false }),
        create_configuration({ plugin_name, input: `${plugin_name}.es`, format: "es", optimize: false }),
        is_production && create_configuration({ plugin_name, input: `${plugin_name}.js`, format: "iife", optimize: true }),
        is_production && create_configuration({ plugin_name, input: `${plugin_name}.es`, format: "es", optimize: true })
    ].filter(Boolean);
}).flat();

export default configurations;

function create_configuration({ plugin_name, input, format, optimize }) {
    const ext_format = format === "es" ? ".esm" : "";
    const ext_min = optimize ? ".min" : "";

    return {
        input,
        treeshake: "smallest",
        output: {
            file: `dist/${plugin_name}/alpinegear-${plugin_name}${ext_format}${ext_min}.js`,
            format: format,
            plugins: optimize && [terser({
                output: {
                    comments: false
                },
                compress: {
                    passes: 5,
                    ecma: 2020,
                    drop_console: false,
                    drop_debugger: true,
                    pure_getters: true,
                    arguments: true,
                    unsafe_comps: true,
                    unsafe_math: true,
                    unsafe_methods: true
                }
            })]
        },
        plugins: [
            ...global_plugins,
            replace({
                preventAssignment: true,
                values: {
                    "__DEV": !optimize
                }
            }),
            virtual({
                [input]: format === "iife"
                    ? `import __${plugin_name} from "src/plugins/${plugin_name}/index.js";
                       document.addEventListener("alpine:init", () => { Alpine.plugin(__${plugin_name}); });`
                    : `export * from "src/plugins/${plugin_name}/index.js";`
            })
        ]
    };
}

function remove_comments() {
    return {
        name: "remove_comments",
        transform(source) {
            return {
                code: strip_comments(source)
            };
        }
    };
}

function trim_ws() {
    return {
        name: "trim_ws",
        generateBundle(options, bundle) {
            if (options.file.match(/\.js$/)) {
                const key = path.basename(options.file);
                bundle[key].code = bundle[key].code.trim();
            }
        }
    };
}
