import path from "node:path";
import { execSync as exec } from "node:child_process";
import { statSync as stat, existsSync as exists } from "node:fs";
import { globSync as glob } from "glob";

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

function delta(a, b) {
    if (a == null || b == null) {
        return null;
    }
    return a - b;
}

function icon(d) {
    if (d == null) {
        return "—";
    }

    if (d > 0) return "⬆️";
    if (d < 0) return "⬇️";
    return "➡️";
}

const pr_files = glob("dist/**/*.min.js");
const pr_sizes = Object.fromEntries(pr_files.map(f => [f, size(f)]));

exec("git fetch origin main", { stdio: "inherit" });
exec("git checkout origin/main", { stdio: "ignore" });
exec("npm ci", { stdio: "inherit" });
exec("npm run build", { stdio: "inherit" });

const main_sizes = Object.fromEntries(pr_files.map(f => [f, size(f)]));

let md = `
### 📦 Bundle size comparison

| Name | main | PR | Δ |
|------|------|----|---|
`;

for (const file of pr_files) {
    const d = delta(pr_sizes[file], main_sizes[file]);

    md += `| \`${path.basename(file)}\` | ${format(main_sizes[file])} | ${format(pr_sizes[file])} | ${icon(d)} ${format(d)} |\n`;
}

console.log(md);
