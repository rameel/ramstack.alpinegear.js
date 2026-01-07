# @ramstack/alpinegear-dialog

[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-dialog)](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-dialog` is a **headless dialog directive for Alpine.js**, built on top of the native HTML `<dialog>` element.

It allows you to describe dialog behavior declaratively.
This makes it especially suitable for **progressive enhancement** and **seamless integration with htmx**.

The plugin provides a small set of composable directives that together form a dialog "component",
while leaving markup, layout, and styling entirely up to you.

## Features

* Declarative dialog composition using Alpine directives
* Supports **modal** and **non-modal** dialogs
* Built on the native `<dialog>` element
* Value-based close semantics
* Promise-based API for imperative control
* Value-scoped events for htmx integration
* Completely headless (no markup or styling constraints)


## Installation

### Using CDN

Include the plugin **before** Alpine.js:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-dialog@1/alpinegear-dialog.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM

Install the package:

```bash
npm install --save @ramstack/alpinegear-dialog
```

Initialize the plugin:

```js
import Alpine from "alpinejs";
import dialog from "@ramstack/alpinegear-dialog";

Alpine.plugin(dialog);
Alpine.start();
```

## Usage

### Basic Example

```html
<div x-dialog:modal>
  <button x-dialog:trigger>Update</button>

  <dialog x-dialog:panel>
    Are you sure you want to continue?

    <div>
      <button x-dialog:action value="yes">Yes</button>
      <button x-dialog:action value="no">No</button>
      <button x-dialog:action>Cancel</button>
    </div>
  </dialog>
</div>
```

Dialogs are composed using the following directives:

* `x-dialog` — dialog root and scope provider  (`x-dialog:modal` enables modal behavior)
* `x-dialog:trigger` — element that opens the dialog
* `x-dialog:panel` — the dialog panel (must be a `<dialog>` element)
* `x-dialog:action` — closes the dialog and optionally provides a return value

### Dialog Modes

The root `x-dialog` directive supports two display modes:

* **Non-modal dialog** (default)
* **Modal dialog**, enabled via `x-dialog:modal`

### Actions and return values

The `x-dialog:action` directive closes the dialog when activated.

* The `value` attribute defines the dialog's return value
* If `value` is omitted, an empty string (`""`) is used as the return value

The return value is propagated through both **events** and the **Promise-based API**.

### Forms in Dialogs

Dialogs can contain forms and fully rely on the browser's native form handling.

```html
<div x-dialog:modal>
  <button x-dialog:trigger>Update details</button>

  <dialog x-dialog:panel>
    <form method="dialog">
      <label>
        Name:
        <input name="username" required />
      </label>

      <div>
        <button value="update">Update</button>
        <button formnovalidate>Cancel</button>
      </div>
    </form>
  </dialog>
</div>
```

#### Notes

* `x-dialog:action` is **optional** inside `<form method="dialog">`
* Native form validation applies automatically
* The dialog closes only if validation succeeds
* `formnovalidate` allows closing the dialog without triggering validation

In practice, the dialog behaves exactly like a standard HTML `<dialog>` with a form.

## Events

All events are dispatched from the `x-dialog` root element.

### `open`

* Fired when the dialog is opened
* Non-cancelable, does not bubble

### `toggle`

* Fired whenever the dialog open state changes
* `event.detail.state` contains the new state (`true` / `false`)
* Non-cancelable, does not bubble

### `beforeclose`

* Fired **before** the dialog is closed
* Cancelable, does not bubble
* `event.detail.value` contains the proposed return value

If this event is canceled, the dialog remains **open**.

### `close:[value]`

* Fired after the dialog is closed
* Value-scoped event
* Event name is normalized to lowercase
* `event.detail.value` contains the return value

Example:
`value="Yes"` >> `close:yes`

### `close`

* Fired after the dialog is fully closed
* `event.detail.value` contains the return value

### Event Example

```html
<div x-dialog:modal
     @open="console.log('open')"
     @beforeclose="console.log('beforeclose', $event.detail.value)"
     @close:yes="console.log('User confirmed')"
     @close="console.log('Dialog closed')">

  <button x-dialog:trigger>Update</button>

  <dialog x-dialog:panel>
    Are you sure you want to continue?

    <div>
      <button x-dialog:action value="yes">Yes</button>
      <button x-dialog:action value="no">No</button>
      <button x-dialog:action>Cancel</button>
    </div>
  </dialog>
</div>
```

## HTMX Integration

Value-scoped close events make integration with **htmx** straightforward without a single line of script.

```html
<div x-dialog:modal
     hx-trigger="close:yes"
     hx-delete="/account/5">

  <button x-dialog:trigger>Deactivate account</button>

  <dialog x-dialog:panel>
    Are you sure you wish to deactivate your account?

    <div>
      <button x-dialog:action value="yes">Yes</button>
      <button x-dialog:action>Cancel</button>
    </div>
  </dialog>
</div>
```

## Nested Dialogs

Nesting `x-dialog` components directly in the DOM is **not supported** and results in **undefined behavior**.

This limitation is intentional and follows native HTML constraints:

* The `<dialog>` element does not define consistent behavior for nested dialogs
* HTML forms cannot be safely nested
* Buttons inside nested dialogs may be treated as part of an outer form
* Validation and submission semantics become unpredictable across browsers

For these reasons, we intentionally do not attempt to emulate or implement workarounds for nested dialog behavior.

### Recommended pattern

A common use case that appears to require nested dialogs is **confirming a destructive or cancel action**
while a dialog is already open (for example, canceling a form with unsaved data).

Instead of nesting dialogs, the recommended approach is to **guard the close operation** using a secondary dialog.

```html
<div x-dialog:modal @beforeclose="confirm"
     x-data="{
       email: '',
       password: '',
       confirm(e) {
         if (!e.detail.value && (this.email || this.password)) {
           e.preventDefault();

           this.$refs.discardconfirm.show().then(result => {
             if (result === 'yes') {
               e.target.close('create');
             }
           });
         }
       }
     }">

  <button x-dialog:trigger>Create</button>

  <dialog x-dialog:panel closedby="closerequest">
    <form method="dialog">
      <h3>Create an account</h3>

      <label>
        Email:
        <input x-model="email" type="email" required />
      </label>

      <label>
        Password:
        <input x-model="password" type="password" required />
      </label>

      <div class="actions">
        <button value="create">Create</button>
        <button formnovalidate>Cancel</button>
      </div>
    </form>
  </dialog>
</div>

<div x-dialog:modal x-ref="discardconfirm">
  <dialog x-dialog:panel closedby="any">
    You have unsaved changes. Discard them?

    <button x-dialog:action value="yes">Yes</button>
    <button x-dialog:action autofocus>No</button>
  </dialog>
</div>
```

### Important Note on `beforeclose`

The `beforeclose` event is dispatched **synchronously**.

As a result, the decision to cancel the close operation **must be made synchronously during event dispatch**.
If the handler returns a `Promise` or performs asynchronous work before calling `preventDefault()`,
the event dispatch will already have completed and the dialog will close regardless.

For this reason:

* `beforeclose` handlers **must not rely on `async / await`**
* `event.preventDefault()` **must be called synchronously**
* Any asynchronous confirmation logic must occur *after* the close has been canceled

In the example above, the flow is:

1. `beforeclose` is dispatched synchronously
2. The handler immediately calls `event.preventDefault()`
3. The close operation is canceled
4. A secondary dialog is shown using `show().then(...)`
5. If the user confirms, the original dialog is closed programmatically


## Properties and Methods

All properties and methods are available within the `x-dialog` scope.

In addition, the same API is exposed on the **root DOM element** to which the `x-dialog` directive is applied.
This allows imperative control via `x-ref` when needed.

```js
const result = await this.$refs.dialog.show();
```

```js
const el = document.getElementById("dialog");
const result = await el.show();
```

### `open` (readonly)

A boolean representing the dialog state:
* `true` — dialog is open; otherwise `false`

### `show(): Promise<string>`

Displays the dialog using the configured display mode (modal or non-modal).

Returns a `Promise<string>` that resolves when the dialog is closed.
The resolved value is the dialog's return value.

### `close(returnValue?: string): void`

Closes the dialog programmatically.

* `returnValue` — string returned by the dialog
* Closing can be prevented by canceling `beforeclose`


## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog

## Related projects

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Provides a combined plugin that includes several useful directives.
This package aggregates multiple individual plugins, offering a convenient all-in-one bundle.
Included directives: `x-bound`, `x-format`, `x-fragment`, `x-match`, `x-template`, and `x-when`.

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

**[@ramstack/alpinegear-template](https://www.npmjs.com/package/@ramstack/alpinegear-template)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template))<br>
Provides the `x-template` directive, which allows you to define a template once anywhere in the DOM and reference it by its ID.

**[@ramstack/alpinegear-fragment](https://www.npmjs.com/package/@ramstack/alpinegear-fragment)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment))<br>
Provides the `x-fragment` directive, which allows for fragment-like behavior similar to what's available in frameworks
like `Vue.js` or `React`, where multiple root elements can be grouped together.

**[@ramstack/alpinegear-match](https://www.npmjs.com/package/@ramstack/alpinegear-match)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/match))<br>
Provides the `x-match` directive, which functions similarly to the `switch` statement in many programming languages,
allowing you to conditionally render elements based on matching cases.

**[@ramstack/alpinegear-when](https://www.npmjs.com/package/@ramstack/alpinegear-when)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/when))<br>
Provides the `x-when` directive, which allows for conditional rendering of elements similar to `x-if`, but supports multiple root elements.

**[@ramstack/alpinegear-destroy](https://www.npmjs.com/package/@ramstack/alpinegear-destroy)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/destroy))<br>
Provides the `x-destroy` directive, which is the opposite of `x-init` and allows you to hook into the cleanup phase
of any element, running a callback when the element is removed from the DOM.

**[@ramstack/alpinegear-hotkey](https://www.npmjs.com/package/@ramstack/alpinegear-hotkey)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/hotkey))<br>
Provides the `x-hotkey` directive, which allows you to easily handle keyboard shortcuts within your Alpine.js components or application.

**[@ramstack/alpinegear-router](https://www.npmjs.com/package/@ramstack/alpinegear-router)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router))<br>
Provides the `x-router` and `x-route` directives, which enable client-side navigation and routing functionality within your Alpine.js application.


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
