# @ramstack/alpinegear-fragment
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-fragment)](https://www.npmjs.com/package/@ramstack/alpinegear-fragment)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-fragment` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-fragment` directive.

This directive allows you to use multiple root elements in your templates, similar to the `Fragment` feature found in frameworks like `Vue.js` and `React`. It is particularly useful when you want to avoid wrapping elements in unnecessary container tags.


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

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
