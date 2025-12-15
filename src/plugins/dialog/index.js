import {
    closest,
    is_dialog,
    is_nullish,
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
        else if (value === "accept") {
            process_accept();
        }
        else if (value === "cancel") {
            process_cancel();
        }
        else if (value === "" || value === "modal") {
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
                        is_nullish(value) ? dialog_cancel() : dialog_accept(value);
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

                        dialog_accept(e.submitter?.value);
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
                    dispatch(owner, el.open ? "open" : "close");
                    dispatch(owner, "toggle", { oldState: e.oldState, newState: e.newState });
                },
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

            //
            // Use setTimeout to defer binding, ensuring this listener executes last
            //
            setTimeout(() =>
                cleanup(
                    listen(el, "cancel", e => {
                        dispatch(owner, "requestcancel", {}, { cancelable: true }) || e.preventDefault();
                        e.defaultPrevented || dispatch(owner, "cancel");
                    })
                )
            );
        }

        function process_trigger() {
            bind(el, {
                "@click.prevent": "$dialog.show"
            });
        }

        function process_accept() {
            //
            // The x-dialog:accept button must be placed inside a <dialog> element.
            //
            if (ensure_dialog_panel("x-dialog:accept")) {
                el.form || bind(el, {
                    "@click.prevent": e => dialog_accept(el.value)
                });
            }
        }

        function process_cancel() {
            //
            // The x-dialog:cancel button must be placed inside a <dialog> element.
            //
            if (ensure_dialog_panel("x-dialog:cancel")) {
                bind(el, {
                    "@click.prevent": dialog_cancel
                });
            }
        }

        function dialog_accept(value) {
            value ??= "ok"
            const { owner, panel } = get_dialog_info();
            const detail = { value };
            if (dispatch(owner, "requestaccept", detail, { cancelable: true })) {
                value && dispatch(owner, "accept:" + value.toLowerCase(), detail);
                dispatch(owner, "accept", detail);
                panel.close(value);
            }
        }

        function dialog_cancel() {
            get_dialog_info().panel?.requestClose();
        }

        function ensure_dialog_panel(name) {
            return !!(closest(el, is_dialog) || warn(name + ": no x-dialog:panel found"));
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
