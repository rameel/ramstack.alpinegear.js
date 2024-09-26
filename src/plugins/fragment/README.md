# @ramstack/alpinegear-fragment

`@ramstack/alpinegear-fragment` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-fragment` directive.

This directive allows you to use multiple root elements in your templates, similar to the `Fragment` feature found in frameworks like `Vue.js` and `React`. It is particularly useful when you want to avoid wrapping elements in unnecessary container tags.


## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-fragment@1/alpinegear-fragment.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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
<div x-data="{ show: true, message: 'Example' }">
    <div>
        <button @click="show = !show">Edit Message</button>
    </div>

    <template x-if="show">
        <template x-fragment>
            <label>Message:</label>
            <input x-model="message" />
        </template>
    </template>
</div>
```
In this example, the `x-fragment` directive allows the `<label>` and `<input>` elements to exist side by side without a parent container.

### Using with `x-for`
The `x-fragment` directive can also be used with the directive `x-for`, giving you the flexibility to render multiple sibling elements for each iteration without wrapping them:

```html
<div x-data="{
    items: [
        { id: 1, term: 'Item 1', description: 'Description 1' },
        { id: 2, term: 'Item 2', description: 'Description 2' },
        { id: 3, term: 'Item 3', description: 'Description 3' } ]
    }">
    <dl>
        <template x-for="item in items" :key="item.id">
            <template x-fragment>
                <dt x-text="item.term"></dt>
                <dd x-text="item.description"></dd>
            </template>
        </template>
    </dl>
</div>
```

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
