# @ramstack/alpinegear-dialog

[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-dialog)](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-dialog` is a **headless dialog directive for Alpine.js** built on top of the native HTML `<dialog>` element.

It allows you to describe dialog behavior declaratively, without coupling logic to JavaScript code.
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
* No styling or markup constraints (headless UI)


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
import Dialog from "@ramstack/alpinegear-dialog";

Alpine.plugin(Dialog);
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

* `x-dialog` – dialog root and scope provider (`x-dialog:modal` enables modal behavior)
* `x-dialog:trigger` – element that opens the dialog
* `x-dialog:panel` – the dialog panel (must be a `<dialog>` element)
* `x-dialog:action` – closes the dialog and optionally provides a return value

### Dialog Modes

The root directive `x-dialog` supports two display modes:

* **Non-modal dialog** (default)
* **Modal dialog**, enabled by using `x-dialog:modal`

### Actions and return values

The `x-dialog:action` directive closes the dialog when activated.

* The `value` attribute defines the dialog's return value
* If `value` is omitted, an empty string (`""`) is used as the return value

The return value is propagated through events and the Promise-based API.

## Forms in dialogs

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

### Notes

* `x-dialog:action` is **optional** inside `<form method="dialog">`
* Native form validation applies automatically
* The dialog closes only if validation succeeds
* `formnovalidate` allows closing the dialog without triggering validation

In short, the dialog behaves exactly like a standard HTML dialog with a form.

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

Value-scoped close events make integration with `htmx` straightforward and js-free.

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

## Nested dialogs

Nesting `x-dialog` components directly in the DOM is **not supported** and results in **undefined behavior**.

This limitation is intentional and is based on native HTML constraints:

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
     }"
>
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

### NOTE

The `beforeclose` event is dispatched **synchronously**.

As a result, the decision to cancel the close operation **must be made synchronously during event dispatch**.
If the event handler returns a `Promise` or performs asynchronous work before calling `preventDefault()`,
the event dispatch will already have completed and the dialog will close regardless.

For this reason:

* `beforeclose` handlers **must not rely on `async / await`**
* `event.preventDefault()` **must be called synchronously**
* any asynchronous confirmation logic must be deferred until after the close has been canceled

In the example above, this is why the confirmation dialog is shown *after* the close has been prevented:

1. `beforeclose` is dispatched synchronously
2. The handler immediately calls `event.preventDefault()`
3. The close operation is canceled
4. A secondary dialog is shown using `show().then(...)`
5. If the user confirms, the original dialog is closed programmatically

## Properties and Methods

All properties and methods are available within the `x-dialog` scope.

In addition, the same API is exposed on the root DOM element to which the `x-dialog` directive is applied.
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


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
