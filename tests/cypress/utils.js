export function html(strings) {
    return strings.raw[0];
}

export function test(name, template, callback) {
    it(name, () => {
        inject(template, callback);
    });
}

function inject(template, callback) {
    cy.visit(__dirname + "/generic.html");

    cy.get("#root").then(([el]) => {
        el.innerHTML = template;
        el.evaluate();

        cy.get("#root[ready]", { timeout: 1000 }).should("be.visible");

        cy.window().then(window => {
            callback(cy, window, window.document);
        });
    });
}
