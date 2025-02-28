import gulp from "gulp";
import json_transform from "gulp-json-transform";
import { loadConfigFile as load_config_file } from "rollup/loadConfigFile";
import { rollup } from "rollup";
import { rimraf } from "rimraf";
import { ConventionalGitClient } from "@conventional-changelog/git-client";

const is_production = process.env.NODE_ENV === "production";

const task_delete = create_task("delete -> delete build folders", () => {
    return rimraf(["dist", "coverage", "docs/public/js"]);
});

const task_update_packages = create_task("update -> update version", async done => {
    if (is_production) {
        const current_version = await obtain_version_from_tag();

        const update_version = data => {
            data.version = current_version;
            return data;
        };

        const timestamp = new Date().toLocaleTimeString("en", { hour12: false });
        console.log(`[\x1b[35m${timestamp}\x1b[0m] Updating version to \x1b[32m${current_version}\x1b[0m`);

        return gulp
            .src("src/plugins/**/package.json")
            .pipe(json_transform(update_version, 2))
            .pipe(gulp.dest("dist"));
    }

    done();
});

const task_copy_readme = create_task("update -> copy README.md", () => {
    return gulp
        .src("src/plugins/**/README.md")
        .pipe(gulp.dest("dist"));
});

const task_bundle_scripts = create_task("bundle -> compile package scripts", async done => {
    const { options: options_list } = await load_config_file("rollup.config.js", {});

    for (let options of options_list) {
        const bundle = await rollup({ ...options,
            onLog(level, log) {
                console.log(`\n\x1b[33m[${level}] ${log}\x1b[0m\n`);
            }
        });

        await Promise.all(options.output.map(bundle.write));
        await bundle.close();
    }

    done();
});

gulp.task("build", done => {
    gulp.series(
        task_delete,
        task_bundle_scripts,
        task_update_packages,
        task_copy_readme)(done);
});

async function obtain_version_from_tag() {
    return (await new ConventionalGitClient(process.cwd()).getVersionFromTags()) || error();

    function error() {
        throw new Error("Failed to obtain version from 'git' tags.");
    }
}

function create_task(name, task) {
    task.displayName = name;
    return task;
}
