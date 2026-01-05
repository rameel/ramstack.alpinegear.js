# @ramstack/alpinegear-hotkey
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-hotkey)](https://www.npmjs.com/package/@ramstack/alpinegear-hotkey)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-hotkey` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-hotkey` directive.

This directive allows you to easily handle keyboard shortcuts within your Alpine.js components or application.

Uses [@ramstack/hotkey](https://github.com/rameel/ramstack.hotkey.js) package under the hood.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-hotkey@1/alpinegear-hotkey.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-hotkey
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import hotkey from "@ramstack/alpinegear-hotkey";

Alpine.plugin(hotkey);
Alpine.start();
```

## Usage
Define a hotkey combination using the directive by specifying key modifiers (such as `Ctrl`, `Alt`, `Shift`) with a `+` sign
(e.g., `Ctrl+Alt+Shift+S`).

Here's a simple example:

```html
<div x-data x-hotkey.shift+f.window="console.log($event.hotkey)">
  Hello, World!
</div>
```

> [!TIP]
> The hotkey is **case-insensitive**. Standard key names are used.
>
> You can find a list of key names here [Key values for keyboard events](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)

### Event Object

The `x-hotkey` directive provides access to the native event object via the magic `$event` property.

```html
<div x-data x-hotkey.shift+f.window="console.log($event)"></div>
```

Also, the `x-hotkey` automatically passes the event object as the first argument to the method handler:

```html
<div x-data x-hotkey.shift+f.window="e => console.log(e)"></div>

<!--  OR  -->
<div x-data x-hotkey.shift+f.window="handle"></div>

<script>
  function handle(e) {
    console.log(e);
  }
</script>
```

### Event Modifiers
To simplify common tasks like calling `event.preventDefault()` or `event.stopPropagation()`,
the `x-hotkey` directive supports following event modifiers:
* `.prevent` - calls `event.preventDefault()` before calling the event handler.
* `.stop` - call `event.stopPropagation()`, stopping the event from propagating further.
* `.passive` - indicates that the handler will never call `event.preventDefault()`.
* `.capture` - calling the event handler in the capture phase instead of the bubbling phase.
* `.once` - ensures the event handler is called only once.
* `.trusted` - ensures that only trusted events are handled.

```html
<!-- prevent the default behavior for the keyboard event -->
<div x-hotkey.ctrl+s.prevent="save($event)"></div>

<!-- the event's propagation will be stopped -->
<div x-hotkey.ctrl+s.stop="save($event)"></div>

<!-- modifiers can be chained -->
<div x-hotkey.ctrl+s.prevent.stop.trusted="save($event)"></div>
```

### Global Event Listening
Use the `window` or `document` modifiers to listen for hotkeys globally, across the entire page:

```html
<div x-hotkey.ctrl+s.window.prevent="save($event)"></div>
```

### Defining Alternative Hotkeys
You can assign multiple hotkeys to a single action by separating them with a dot (`.`).
For instance, in the example below, the same action is triggered by both `Ctrl + Shift + S` and `Alt + U`.

To determine which hotkey triggered the event, use the `hotkey` property from the event object.
This property contains the string representation of the hotkey.

```html
<div x-data x-hotkey.ctrl+shift+f.alt+u.window="console.log($event.hotkey)">
  Hello, World!
</div>
```

### Specific Events Listening
To change the event that `x-hotkey` listens for, use a directive argument.
By default, the event is `keydown`, but you can specify `keyup`, `keypress`, or others:

```html
<div x-hotkey:keyup.alt+u="console.log('Search...')"></div>
```

### Exclude Elements

If you want to prevent hotkey handling from being triggered by specific elements, add the `data-hotkey-ignore` attribute to those elements:

```html
<div x-hotkey.shift+k="...">
  ...
  <!-- Ignoring hotkeys from the input element -->
  <input type="text" data-hotkey-ignore>
</div>
```

You can also exclude a group of elements by applying the attribute to their parent:

```html
<div x-hotkey.shift+k="...">
  ...

  <!-- Ignoring hotkeys from all elements within the form -->
  <form data-hotkey-ignore>
  ...
  </form>
</div>
```

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/hotkey


## Related projects

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Provides a combined plugin that includes several useful directives.
This package aggregates multiple individual plugins, offering a convenient all-in-one bundle.
Included directives: `x-bound`, `x-format`, `x-fragment`, `x-match`, `x-template`, and `x-when`.

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

**[@ramstack/alpinegear-format](https://www.npmjs.com/package/@ramstack/alpinegear-format)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/format))<br>
Provides the `x-format` directive, which allows you to easily interpolate text using a template syntax similar to what's available in `Vue.js`.

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

**[@ramstack/alpinegear-router](https://www.npmjs.com/package/@ramstack/alpinegear-router)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router))<br>
Provides the `x-router` and `x-route` directives, which enable client-side navigation and routing functionality within your Alpine.js application.

**[@ramstack/alpinegear-dialog](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog))<br>
Provides a headless dialog directive for Alpine.js based on the native HTML `<dialog>` element.
It supports declarative composition, value-based close semantics, and both modal and non-modal dialogs,
with optional Promise-based imperative control.


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
