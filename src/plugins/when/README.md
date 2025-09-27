# @ramstack/alpinegear-when
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-when)](https://www.npmjs.com/package/@ramstack/alpinegear-when)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-when` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-when` directive.

This directive is used for conditionally rendering elements on the page, similar to `x-if`.

However, unlike `x-if`, it supports multiple root elements inside the `<template>` tag.
Essentially, `x-when` works like a combination of `x-if` and [x-fragment](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment), but with cleaner syntax. There's no need to nest multiple `<template>` tags, which makes the markup simpler and easier to manage.

> [!Note]
> This package is part of the **[`@ramstack/alpinegear-main`](https://www.npmjs.com/package/@ramstack/alpinegear-main)** bundle.
> If you are using the main bundle, you don't need to install this package separately.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-when@1/alpinegear-when.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-when
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import when from "@ramstack/alpinegear-when";

Alpine.plugin(when);
Alpine.start();
```

## Usage
The `x-when` directive functions similarly to `x-if`, but allows multiple root elements in the `<template>` tag:

```html
<div x-data="{ show: false }">
  <button @click="show = !show">Show more</button>

  <ul>
    <li>Apple</li>
    <li>Banana</li>

    <template x-when="show">
      <li>Orange</li>
      <li>Grape</li>
      <li>Mango</li>
    </template>
  </ul>
</div>
```
🚀 [Live demo | Alpine.js x-when: Multiple root elements](https://jsfiddle.net/rameel/91zhsLqp/)

### Using with `x-for`
The `x-when` directive can also be used with the directive `x-for` to conditionally render multiple items:

```html
<div x-data="{
  items: [
    { term: 'Star', description: 'Luminous plasma sphere.' },
    { term: 'Planet', description: 'Body orbiting a star.' },
    { term: 'Galaxy', description: 'Stars and dust system.' },
    { term: 'Nebula', description: 'Cloud of gas in space.' }
  ]}">
  <button @click="items.reverse()">Reverse</button>

  <dl>
    <template x-for="item in items" :key="item.term">
      <template x-when="true">
        <dt x-text="item.term"></dt>
        <dd x-text="item.description"></dd>
      </template>
    </template>
  </dl>
</div>
```
🚀 [Live demo | Alpine.js x-when: Multiple root elements with x-for](https://jsfiddle.net/rameel/cuoh3297/)

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/when

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
