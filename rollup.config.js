import alias from "@rollup/plugin-alias";
import color from "picocolors";
import maxmin from "maxmin";
import node_resolve from "@rollup/plugin-node-resolve";
import path from "node:path";
import replace from "@rollup/plugin-replace";
import strip_comments from "strip-comments";
import terser from "@rollup/plugin-terser";
import virtual from "@rollup/plugin-virtual";
import { fileURLToPath } from "node:url";
import { globSync as glob } from "glob";

const is_production = process.env.NODE_ENV === "production";

const global_plugins = optimize => [
    node_resolve(),
    optimize && remove_comments(),
    optimize && trim_ws(),
    bundle_size(),
    alias({
        entries: [
            {
                find: "@",
                replacement: path.join(path.dirname(fileURLToPath(import.meta.url)), "src")
            }
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
            ...global_plugins(optimize),
            replace({
                preventAssignment: true,
                values: {
                    "__DEV__": !optimize
                }
            }),
            virtual({
                [input]: format === "iife"
                    ? `import { listen } from "src/utilities/utils.js";
                       import __${plugin_name} from "src/plugins/${plugin_name}/index.js";
                       listen(document, "alpine:init", () => { Alpine.plugin(__${plugin_name}); });`
                    : `import plugin from "src/plugins/${plugin_name}/index.js";
                       export default plugin;
                       export * from "src/plugins/${plugin_name}/index.js";`
            })
        ]
    };
}

function remove_comments() {
    return {
        name: "remove_comments",
        transform(source) {
            return {
                code: strip_comments(source, {})
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

function bundle_size() {
    return {
        name: "bundle_size",
        generateBundle(options, bundle) {
            const name = path.basename(options.file);
            const size = maxmin(bundle[name].code, bundle[name].code, true);
            this.info(`Produced '${color.cyan(name)}': ${size.slice(size.indexOf(' → ') + 3)}`);
        }
    };
}
