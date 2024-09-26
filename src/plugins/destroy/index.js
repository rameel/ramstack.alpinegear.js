function plugin(alpine) {
    alpine.directive("destroy", (_, { expression }, { cleanup, evaluate }) => {
        cleanup(() => evaluate(expression));
    });
}

export default plugin;
export {
    plugin as destroy
}
