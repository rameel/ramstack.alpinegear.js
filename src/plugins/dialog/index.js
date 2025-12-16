import {
    closest,
    is_dialog,
    is_template,
    listen,
    warn
} from "@/utilities/utils";

function plugin({ $data, addScopeToNode, bind, directive }) {
    directive("dialog", (el, { expression, value }, { cleanup }) => {
        const get_dialog_info = () => closest(el, n => n._r_dialog)?._r_dialog;

        value ||= "";

        if (!get_dialog_info() && value !== "modal" && value !== "") {
            warn("no x-dialog found");
            return;
        }

        if (value === "panel") {
            process_panel();
        }
        else if (value === "trigger") {
            process_trigger();
        }
        else if (value === "action") {
            process_action();
        }
        else if (value === "modal" || !value) {
            process_dialog();
        }
        else {
            __DEV__ && warn(`Unknown x-dialog:${value} directive`);
        }

        function process_dialog() {
            if (is_template(el)) {
                return warn("x-dialog cannot be used on a 'template' tag");
            }

            el._r_dialog = {
                owner: el,
                panel: null,
                modal: value === "modal"
            };

            addScopeToNode(el, {
                $dialog: {
                    show() {
                        const { panel, modal } = get_dialog_info();
                        if (panel) {
                            return new Promise(resolve => {
                                listen(panel, "close", () => resolve(panel.returnValue), { once: true });
                                panel[modal ? "showModal" : "show"]();
                            });
                        }
                        return Promise.resolve();
                    },
                    close(value = null) {
                        dialog_close(value);
                    }
                }
            });

            cleanup(
                //
                // Listening to the "submit" event on the document element, ensuring (to some extent)
                // that our handler executes last among all handlers listening for this event.
                // This allows us to determine whether the event was canceled by someone else.
                //
                listen(document, "submit", e => {
                    if (e.target.method === "dialog" && closest(e.target, n => n === el) && !e.defaultPrevented) {
                        //
                        // Prevent the dialog from closing immediately,
                        // as we need to trigger our own custom events first.
                        //
                        e.preventDefault();

                        dialog_close(e.submitter?.value);
                    }
                })
            );
        }

        function process_panel() {
            if (!is_dialog(el)) {
                return warn("x-dialog:panel can only be used on a 'dialog' element");
            }

            if (__DEV__ && get_dialog_info().panel) {
                warn("x-dialog:panel is already present. Only the last one will be used.");
            }

            const owner = get_dialog_info().owner;
            get_dialog_info().panel = el;

            bind(el, {
                "@toggle": e => {
                    el.open && dispatch(owner, "open");
                    dispatch(owner, "toggle", { state: e.newState });
                },
                "@cancel.prevent": e => dialog_close(),
                //
                // https://issues.chromium.org/issues/346597066
                // HTMLDialogElement's "cancel" event is not cancelable when "ESC" key is pressed several times
                //
                "@keydown.escape.prevent.stop": e => {
                    //
                    // https://bugs.webkit.org/show_bug.cgi?id=284592
                    // Safari still lacks native support for the "closedby" attribute on <dialog>
                    //
                    if (["any", "closerequest"].includes(el.getAttribute("closedby"))) {
                        //
                        // "requestClose" fires a "cancel" event before firing the "close" event
                        //
                        el.requestClose();
                    }
                }
            });
        }

        function process_trigger() {
            bind(el, {
                "@click.prevent": "$dialog.show"
            });
        }

        function process_action() {
            //
            // The x-dialog:action button must be placed inside a <dialog> element.
            //
            if (!closest(el, is_dialog)) {
                return warn("x-dialog:action is missing a parent x-dialog:panel");
            }

            el.form || bind(el, {
                "@click.prevent": e => dialog_close(el.value)
            });
        }

        function dialog_close(value) {
            value ??= "";

            const { owner, panel } = get_dialog_info();
            const detail = { value };

            if (dispatch(owner, "requestclose", detail, { cancelable: true })) {
                value && dispatch(owner, "close:" + value.toLowerCase(), detail);
                dispatch(owner, "close", detail);
                panel.close(value);
            }
        }

        function dispatch(el, name, detail = {}, options = {}) {
            return el.dispatchEvent(new CustomEvent(name, { detail, ...options }));
        }
    });
}

export default plugin;
export {
    plugin as dialog
}
