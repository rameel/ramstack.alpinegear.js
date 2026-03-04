import path from "node:path";
import { execSync as exec } from "node:child_process";
import { globSync as glob } from "glob";
import {
    existsSync as exists,
    readFileSync as read_file,
    statSync as stat,
    writeFileSync as write_file
} from "node:fs";
import {
    brotliCompressSync as brotli,
    gzipSync as gzip
} from "node:zlib";

const MAIN_WORKTREE = ".worktrees/main";

function size(file) {
    return exists(file) ? stat(file).size : null;
}

function gzip_size(file) {
    return exists(file)
        ? gzip(read_file(file)).length
        : null;
}

function brotli_size(file) {
    return exists(file)
        ? brotli(read_file(file)).length
        : null;
}

function gather_file_sizes(file) {
    return {
        no: size(file),
        gz: gzip_size(file),
        br: brotli_size(file)
    };
}

function format(length) {
    if (length == null) {
        return "—";
    }

    return length >= 1024
        ? `${(length / 1024).toFixed(2)} KiB`
        : `${length} B`;
}

function delta(pr, main) {
    if (pr == null || main == null) {
        return null;
    }
    return pr - main;
}

function format_delta(pr, main) {
    if (pr == null || main == null) {
        return "-";
    }

    let s = format(pr);
    let d = pr - main;

    if (d !== 0) {
        const sign = d > 0 ? "+" : "";
        s += ` (${sign}${format(d)})`;
    }

    return s;
}

function icon(d) {
    if (d == null) {
        return "—";
    }

    if (d > 0) return "🔴";
    if (d < 0) return "🟢";
    return "";
}

function has_local_origin_main() {
    try {
        exec('git show-ref --verify --quiet refs/remotes/origin/main', { stdio: "inherit" });
        return true;
    }
    catch {
        return false;
    }
}

function generate_report(files, pr, main) {
    const rows = files.map(file => {
        const d = delta(pr[file].no, main[file].no);

        return [
            path.basename(file),
            format_delta(pr[file].no, main[file].no),
            format_delta(pr[file].gz, main[file].gz),
            format_delta(pr[file].br, main[file].br),
            icon(d)
        ];
    });

    const headers = ["Name", "Size", "Gzip", "Brotli", "Δ"];
    const all_rows = [headers, ...rows];
    const column_widths = headers.map((_, i) => Math.max(...all_rows.map(r => r[i].length)));

    function format_separator() {
        return `|${column_widths.map(format_column).join("|")}|`;

        function format_column(w, i)
        {
            const width = w + 2;
            return i === 0
                ? ":" + "-".repeat(width - 1)
                : "-".repeat(width - 1) + ":";
        }
    }

    function format_row(row) {
        return `| ${row.map(format_column).join(" | ")} |`;

        function format_column(cell, i) {
            const width = column_widths[i];
            return i === 0 ? cell.padEnd(width) : cell.padStart(width);
        }
    }

    let md = "\n### 📦 Bundle size comparison\n\n";

    md += format_row(headers) + "\n";
    md += format_separator() + "\n";

    for (const row of rows) {
        md += format_row(row) + "\n";
    }

    console.log(md);
    process.env.SIZE_REPORT_OUTPUT && write_file(process.env.SIZE_REPORT_OUTPUT, md.trim());
}

try {
    //
    // PR build
    //
    exec("pnpm run build", { stdio: "inherit" });

    const pr_files = glob("dist/**/*.min.js");
    const pr_sizes = Object.fromEntries(pr_files.map(f => [f, gather_file_sizes(f)]));

    //
    // Main build
    //
    has_local_origin_main() || exec("git fetch origin main", { stdio: "inherit" });
    exec(`git worktree add ${MAIN_WORKTREE} origin/main`, { stdio: "ignore" });
    exec("pnpm i", { cwd: MAIN_WORKTREE, stdio: "inherit" });
    exec("pnpm run build", { cwd: MAIN_WORKTREE, stdio: "inherit" });

    const release_sizes = Object.fromEntries(
        pr_files.map(f => [f, gather_file_sizes(path.join(MAIN_WORKTREE, f))]));

    generate_report(pr_files, pr_sizes, release_sizes);
}
catch (e) {
    console.log(e);
}
finally {
    exec(`git worktree remove -f ${MAIN_WORKTREE}`, { stdio: "inherit" });
}
