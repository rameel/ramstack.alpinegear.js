import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        fixturesFolder: "tests/cypress/fixtures",
        specPattern: "tests/cypress/e2e/**/*.cy.js",
        screenshotOnRunFailure: false,
        screenshotsFolder: "tests/cypress/screenshots",
        downloadsFolder: "tests/cypress/downloads",
        videosFolder: "tests/cypress/videos",
        supportFolder: "tests/cypress/support",
        supportFile: "tests/cypress/support/e2e.js",
    }
});
