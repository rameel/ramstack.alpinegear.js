import gulp from "gulp";
import gulp_json_transform from "gulp-json-transform";
import logger from "gulplog";
import path from "node:path";
import { ConventionalGitClient } from "@conventional-changelog/git-client";
import { gulpPlugin as gulp_plugin } from "gulp-plugin-extras";
import { loadConfigFile as load_config_file } from "rollup/loadConfigFile";
import { rimraf } from "rimraf";
import { rollup } from "rollup";

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

        return gulp
            .src("src/plugins/**/package.json")
            .pipe(gulp_json_transform(update_version, 2))
            .pipe(gulp_title(p => `Updating version in \x1b[36m${p}\x1b[0m to \x1b[32m${current_version}\x1b[0m`))
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
                const message = log.message.replace(/^\[[^]+]\s*/, "");
                const level_fname = ["warn", "error"].includes(level) ? level : "info";

                logger[level_fname](message);
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

function gulp_title(format_callback) {
    return gulp_plugin("gulp-title", file => {
        const relative_path = path.relative(file.cwd, file.path)
        const title = format_callback(relative_path);
        title && logger.info(title);
        return file;
    });
}
