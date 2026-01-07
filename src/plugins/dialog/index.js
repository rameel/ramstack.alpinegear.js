import {
    closest,
    is_dialog,
    listen,
    warn
} from "@/utilities/utils";

function plugin({ bind, directive }) {
    directive("dialog", (el, { value }, { cleanup }) => {
        const get_dialog_info = () => closest(el, n => n._r_dialog)?._r_dialog;

        value ||= "";

        if (!get_dialog_info() && value !== "modal" && value !== "") {
            warn(`x-dialog:${value} is missing a parent x-dialog`);
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
            el._r_dialog = {
                owner: el,
                panel: null,
                modal: value === "modal"
            };

            Object.defineProperty(el, "open", {
                get() {
                    return !!el._r_dialog?.panel.open;
                }
            });

            Object.assign(el, {
                show() {
                    return dialog_show();
                },
                close(value) {
                    dialog_close(value);
                }
            });

            bind(el, {
                "x-data"() {
                    return {
                        open: false,
                        show() {
                            return dialog_show();
                        },
                        close(value) {
                            dialog_close(value);
                        }
                    }
                }
            });
        }

        function process_panel() {
            if (__DEV__ && get_dialog_info().panel) {
                warn("x-dialog:panel is already present. Only the last one will be used.");
            }

            if (!is_dialog(el)) {
                warn("x-dialog:panel should be used on a <dialog> element");
                return;
            }

            const owner = get_dialog_info().owner;
            get_dialog_info().panel = el;

            bind(el, {
                "x-init"() {
                    this.open = el.open;
                },
                "@toggle"(e) {
                    (this.open = el.open) && dispatch(owner, "open");
                    dispatch(owner, "toggle", { state: e.newState });
                },
                "@cancel.prevent"() {
                    dialog_close();
                },
                //
                // https://issues.chromium.org/issues/346597066
                // HTMLDialogElement's "cancel" event is not cancelable when "ESC" key is pressed several times
                //
                "@keydown.escape.prevent.stop"() {
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

        function process_trigger() {
            bind(el, {
                "@click.prevent": "show"
            });
        }

        function process_action() {
            if (!closest(el, is_dialog)) {
                warn("x-dialog:action is missing a parent x-dialog:panel");
                return;
            }

            el.form || bind(el, {
                "@click.prevent"() {
                    dialog_close(el.value);
                }
            });
        }

        function dialog_show() {
            const { panel, modal } = get_dialog_info();

            if (panel) {
                return new Promise(resolve => {
                    listen(panel, "close", () => resolve(panel.returnValue), { once: true });
                    panel[modal ? "showModal" : "show"]();
                });
            }

            return Promise.resolve();
        }

        function dialog_close(value) {
            value ??= "";

            const { owner, panel } = get_dialog_info();
            const detail = { value };

            if (dispatch(owner, "beforeclose", detail, { cancelable: true })) {
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
