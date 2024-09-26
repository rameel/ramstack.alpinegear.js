# @ramstack/alpinegear-hotkey

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
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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

The `x-hotkey` directive provides access to the native JavaScript event object via the magic `$event` property.

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
* `.passive` - indicates that the handler will never call `event.preventDefault()`, which improves scrolling performance for touch and wheel events.
* `.capture` - calling the event handler in the capture phase instead of the bubbling phase.
* `.once` - ensures the event handler is called only once.

```html
<!-- prevent the default behavior for the keyboard event -->
<div x-hotkey.ctrl+s.prevent="save($event)"></div>

<!-- the event's propagation will be stopped -->
<div x-hotkey.ctrl+s.stop="save($event)"></div>

<!-- modifiers can be chained -->
<div x-hotkey.ctrl+s.prevent.stop="save($event)"></div>
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

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
