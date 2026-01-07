import path from "node:path";
import { execSync as exec } from "node:child_process";
import { statSync as stat, existsSync as exists, writeFileSync as write_file } from "node:fs";
import { globSync as glob } from "glob";

const MAIN_WORKTREE = ".worktrees/main";

function size(file) {
    return exists(file) ? stat(file).size : null;
}

function format(bytes) {
    if (bytes == null) {
        return "—";
    }

    return bytes >= 1024
        ? `${(bytes / 1024).toFixed(2)} KB`
        : `${bytes} B`;
}

function delta(pr, main) {
    if (pr == null || main == null) {
        return null;
    }
    return pr - main;
}

function icon(delta) {
    if (delta == null) {
        return "—";
    }

    if (delta > 0) return "🔴";
    if (delta < 0) return "🟢";
    return "";
}

function has_local_origin_main() {
    try {
        exec('git show-ref --verify --quiet refs/remotes/origin/main', { stdio: ["pipe", "pipe", "pipe"] });
        return true;
    }
    catch {
        return false;
    }
}

function generate_report(files, pr, main) {
    let md = `
### 📦 Bundle size comparison

| Name | main | PR | Δ | Delta  |
|------|-----:|---:|---|-------:|
`;

    for (const file of files) {
        const d = delta(pr[file], main[file]);

        md += `| ${path.basename(file)} | ${format(main[file])} | ${format(pr[file])} | ${icon(d)} | ${format(d)} |\n`;
    }

    console.log(md);
    process.env.SIZE_REPORT_OUTPUT && write_file(process.env.SIZE_REPORT_OUTPUT, md.trim());
}

try {
    //
    // PR build
    //
    exec("npm run build", { stdio: "inherit" });

    const pr_files = glob("dist/**/*.min.js");
    const pr_sizes = Object.fromEntries(pr_files.map(f => [f, size(f)]));

    //
    // Main build
    //
    has_local_origin_main() || exec("git fetch origin main", { stdio: "inherit" });
    exec(`git worktree add ${MAIN_WORKTREE} origin/main`, { stdio: "ignore" });
    exec("npm ci --include=dev", { cwd: MAIN_WORKTREE, stdio: "inherit" });
    exec("npm run build", { cwd: MAIN_WORKTREE, stdio: "inherit" });

    const main_sizes = Object.fromEntries(
        pr_files.map(f => [f, size(path.join(MAIN_WORKTREE, f))]));

    generate_report(pr_files, pr_sizes, main_sizes);
}
finally {
    exec(`git worktree remove ${MAIN_WORKTREE}`, { stdio: "inherit" });
}
