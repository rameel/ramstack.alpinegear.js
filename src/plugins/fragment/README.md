# @ramstack/alpinegear-fragment
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-fragment)](https://www.npmjs.com/package/@ramstack/alpinegear-fragment)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-fragment` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-fragment` directive.

This directive allows you to use multiple root elements in your templates, similar to the `Fragment` feature found in frameworks like `Vue.js` and `React`. It is particularly useful when you want to avoid wrapping elements in unnecessary container tags.

> [!Note]
> This package is part of the **[`@ramstack/alpinegear-main`](https://www.npmjs.com/package/@ramstack/alpinegear-main)** bundle.
> If you are using the main bundle, you don't need to install this package separately.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-fragment@1/alpinegear-fragment.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-fragment
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import fragment from "@ramstack/alpinegear-fragment";

Alpine.plugin(fragment);
Alpine.start();
```

## Usage
With the `x-fragment` directive, you can use multiple root elements in your components without needing a wrapper container:

```html
<div x-data="{ show: false }">
  <button @click="show = !show">Show more</button>

  <ul>
    <li>Apple</li>
    <li>Banana</li>

    <template x-if="show">
      <template x-fragment>
        <li>Orange</li>
        <li>Grape</li>
        <li>Mango</li>
      </template>
    </template>
  </ul>
</div>
```
🚀 [Live demo | Alpine.js x-fragment: Multiple root elements](https://jsfiddle.net/rameel/jdwuoatf/)

In this example, the `x-fragment` directive allows the `<li>` elements (Orange, Grape, and Mango) to be added
to the `<ul>` without a parent container, enabling multiple root elements in the `x-if` template.

### Using with `x-for`
The `x-fragment` directive can also be used with the directive `x-for`, giving you the flexibility to render
multiple sibling elements for each iteration without wrapping them:

```html
<div x-data="{
  items: [
    { term: 'Star', description: 'Luminous plasma sphere.' },
    { term: 'Planet', description: 'Body orbiting a star.' },
    { term: 'Galaxy', description: 'Stars and dust system.' },
    { term: 'Nebula', description: 'Cloud of gas in space.' }]
  }">
  <button @click="items.reverse()">Reverse</button>

  <dl>
    <template x-for="item in items" :key="item.term">
      <template x-fragment>
        <dt x-text="item.term"></dt>
        <dd x-text="item.description"></dd>
      </template>
    </template>
  </dl>
</div>
```
🚀 [Live demo | Alpine.js x-fragment: Multiple root elements with x-for](https://jsfiddle.net/rameel/201rmntc/)

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment


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

**[@ramstack/alpinegear-dialog](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog))<br>
Provides a headless dialog directive for Alpine.js based on the native HTML `<dialog>` element.
It supports declarative composition, value-based close semantics, and both modal and non-modal dialogs,
with optional Promise-based imperative control.


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
