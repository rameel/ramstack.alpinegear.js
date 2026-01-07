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


## Related packages
This package is part of **[AlpineGear](https://github.com/rameel/ramstack.alpinegear.js)** —
a collection of utilities and directives for [Alpine.js](https://alpinejs.dev).

You can find the full list of related packages and their documentation here:
https://github.com/rameel/ramstack.alpinegear.js


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
