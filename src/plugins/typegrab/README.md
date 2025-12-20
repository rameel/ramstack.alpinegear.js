# @ramstack/alpinegear-typegrab

[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-typegrab)](https://www.npmjs.com/package/@ramstack/alpinegear-typegrab)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-typegrab` is a lightweight plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-typegrab` directive.

The directive automatically focuses an element when the user starts typing **any printable, non-whitespace character**,
as long as no editable element is currently focused. This is useful for search inputs, command palettes,
and similar UX patterns where typing should immediately direct input to a specific field.

## How it works

* Listens globally to the `keydown` event.
* Triggers only for **printable, non-whitespace characters**.
* Ignores events with `Ctrl`, `Alt`, or `Meta` modifiers.
* Does nothing if the active element is `input`, `textarea`, or an element with `contenteditable`.
* Focuses the element marked with `x-typegrab`.

## Installation

### Using CDN

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-typegrab@1/alpinegear-typegrab.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM

```bash
npm install --save @ramstack/alpinegear-typegrab
```

```js
import Alpine from "alpinejs";
import Typegrab from "@ramstack/alpinegear-typegrab";

Alpine.plugin(Typegrab);
Alpine.start();
```

## Usage

```html
<input
  type="search"
  placeholder="Type to search..."
  x-typegrab
/>
```

When the user presses any printable character key (excluding whitespace) while no other editable element is focused,
this input will automatically receive focus.

## Notes

* The directive does not cancel or modify the original keyboard event.
* The target element must be focusable.
* Focus will not be stolen from active editable elements.

## Source code

You can find the source code for this plugin on GitHub:
https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/typegrab

## Contributions

Bug reports and contributions are welcome.

## License

This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
