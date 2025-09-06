import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/playwright",
    fullyParallel: true,
    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,
    // Retry on CI only
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ["html", { open: "never", outputFolder: "playwright-report" }]
    ],
    use: {
        trace: "on-first-retry"
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"]
            },
        },
        {
            name: "firefox",
            use: {
                ...devices["Desktop Firefox"]
            },
        }
    ]
});
