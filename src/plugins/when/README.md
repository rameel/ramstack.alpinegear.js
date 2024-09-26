# @ramstack/alpinegear-when

`@ramstack/alpinegear-when` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-when` directive.

This directive is used for conditionally rendering elements on the page, similar to `x-if`.

However, unlike `x-if`, it supports multiple root elements inside the `<template>` tag.
Essentially, `x-when` works like a combination of `x-if` and [x-fragment](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment), but with cleaner syntax. There's no need to nest multiple `<template>` tags, which makes the markup simpler and easier to manage.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-when@1/alpinegear-when.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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
<div x-data="{ show: true, message: 'Example' }">
    <div>
        <button @click="show = !show">Edit Message</button>
    </div>

    <template x-when="show">
        <label>Message:</label>
        <input x-model="message" />
    </template>
</div>
```

### Using with `x-for`
The `x-when` directive can also be used with the directive `x-for` to conditionally render multiple items:

```html
<div x-data="{
    items: [
        { id: 1, visible: true, term: 'Item 1', description: 'Description 1' },
        { id: 2, visible: false, term: 'Item 2', description: 'Description 2' },
        { id: 3, visible: true, term: 'Item 3', description: 'Description 3' } ]
    }">
    <dl>
        <template x-for="item in items" :key="item.id">
            <template x-when="item.visible">
                <dt x-text="item.term"></dt>
                <dd x-text="item.description"></dd>
            </template>
        </template>
    </dl>
</div>
```

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/when

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
