# @ramstack/alpinegear-destroy
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-destroy)](https://www.npmjs.com/package/@ramstack/alpinegear-destroy)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-destroy` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-destroy` directive.

This directive is the opposite of `x-init` and allows you to hook into the cleanup phase of any element in Alpine,
running a callback when the element is removed from the DOM.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-destroy@1/alpinegear-destroy.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-destroy
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import destroy from "@ramstack/alpinegear-destroy";

Alpine.plugin(destroy);
Alpine.start();
```

## Usage
In this example, when the `<div>` is removed, the message `Element destroyed` will appear.

```html
<div x-data="{ show: true, destroyed: false }">
  <button @click="show = false">Remove element</button>
  <button @click="show = true, destroyed = false">Reset</button>

  <p x-show="destroyed">
    Element destroyed
  </p>

  <template x-if="show">
    <p x-destroy="destroyed = true">
      Hello, World!
    </p>
  </template>
</div>
```
🚀 [Live demo | Alpine.js x-destroy: Handle DOM element removal](https://jsfiddle.net/rameel/qcnwm2b0/)

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/destroy

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
