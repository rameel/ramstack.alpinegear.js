# @ramstack/alpinegear-destroy

`@ramstack/alpinegear-destroy` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-destroy` directive.

This directive is the opposite of `x-init` and allows you to execute code when an element is removed from the DOM.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-destroy@1/alpinegear-destroy.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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
  <button @click="show = false">Hide message</button>

  <p x-show="destroyed">
    <u>Element destroyed</u>
  </p>

  <template x-if="show">
    <div x-destroy="destroyed = true">
      <p>Hello, World!</p>
    </div>
  </template>
</div>
```

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/destroy

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
