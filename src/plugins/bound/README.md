# @ramstack/alpinegear-bound
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-bound)](https://www.npmjs.com/package/@ramstack/alpinegear-bound)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-bound` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-bound` directive.

This directive allows for two-way binding between input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

> [!Note]
> This package is part of the **[`@ramstack/alpinegear-main`](https://www.npmjs.com/package/@ramstack/alpinegear-main)** bundle.
> If you are using the main bundle, you don't need to install this package separately.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-bound@1/alpinegear-bound.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-bound
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import bound from "@ramstack/alpinegear-bound";

Alpine.plugin(bound);
Alpine.start();
```

## Usage

The syntax for binding properties is `x-bound:property="dataprop"`.

Let's take the following example:

```html
<div x-data="{ name: '' }">
  <input x-bound:value="name" />
  Hello <span x-text="name"></span>!

  <button @click="name = 'John'">Change Name</button>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Basic usage](https://jsfiddle.net/rameel/8cw23y7o/)

In this example, we bind the `name` property to the `value` property of the `<input>` element.
Since `x-bound` provides two-way binding, any changes to `name` will be reflected in the `<input>` element,
as will occur when the `button` is clicked.

### Shorthand Syntax
The `x-bound` directive also supports shorthand syntax: `&`.

So the previous example could be written as follows:

```html
<input &value="name" />
```

If the element's property name matches the bound data property, you can simplify this further:
```html
<input x-bound:value />
```

In this example, the repetition of the `value` in `x-bound:value="value"` is redundant,
so we can simply shorten it to `<input x-bound:value>`. Since we can use `&` instead of `x-bound`,
the example can be written as follows:

```html
<input &value />
```

More examples:

```html
<div x-data="{ name: '', text: '', yes: true, methods: [] }">
  <input &value="name" />
  <textarea &value="text"></textarea>
  <input &checked="yes" type="checkbox" />
  <select &value="methods">
    ...
  </select>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Shorthand Syntax](https://jsfiddle.net/rameel/9ys23n4z/)

### Binding Numeric Inputs

For `<input>` elements with `type="number"` and `type="range"`, values are automatically coerced into numbers.
If the `<input>` value is empty or invalid, the bound property will be set to `null`.

```html
<input &value="number" type="number" />
```
🚀 [Live demo | Alpine.js x-bound: Bind Numeric Inputs](https://jsfiddle.net/rameel/e160vsta/)

### Binding `<input type="file">`

For `<input>` elements with `type="file"`, the binding is applied to the `files` property,
resulting in a [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) object being assigned,
containing the list of selected files.

```html
<input &files type="file" accept="image/jpeg" />
```
🚀 [Live demo | Alpine.js x-bound: Bind Files](https://jsfiddle.net/rameel/phy2zn0a/)


### Binding `<select>`

To bind the value of a `<select>` element, use the `value` property:
```html
<div x-data="{ fruit: '' }">
  <select &value="fruit">
    <option value="" disabled>Select...</option>
    <option>Apple</option>
    <option>Banana</option>
    <option>Orange</option>
    <option>Grape</option>
    <option>Mango</option>
  </select>

  <p>
    Fruit: <span x-text="fruit"></span>
  </p>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Binding select](https://jsfiddle.net/rameel/fs12bo5m/)


For a `<select multiple>` element, the data property is an array containing the values of the selected options.

```html
<div x-data="{ pets: ['goldfish', 'parrot'] }">
  <select &value="pets" multiple>
    <option value="cat">Cat</option>
    <option value="goldfish">Goldfish</option>
    <option value="parrot">Parrot</option>
    <option value="spider">Spider</option>
  </select>

  Pets: <span x-text="pets"></span>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Multiple select](https://jsfiddle.net/rameel/kq0xseo1/)


### Binding `<details>`

The directive also allows binding to the `open` property of `<details>` elements:

```html
<div x-data="{ open: true }">
  <details &open>
    <summary>Details</summary>
    <p>Something small enough to escape casual notice.</p>
  </details>

  <p>
    <label>
      <input &checked="open" type="checkbox" />
      Open / Close
    </label>
  </p>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Binding details](https://jsfiddle.net/rameel/fw2bkLqv/)

### Binding `<img>` sizes

You can bind the `naturalWidth` and `naturalHeight` properties of an image after it loads:

```html
<img src="..." &naturalWidth="width" &naturalHeight="height" />
```
🚀 [Live demo | Alpine.js x-bound: Binding image sizes](https://jsfiddle.net/rameel/q4vb1d0w/)

> [!TIP]
> If you prefer using `kebab-case` for multi-word properties like `naturalWidth`, you can write it as `natural-width`. It will be automatically normalized internally:
> ```html
> <img src="..." &natural-width="width" &natural-height="height" />
> ```

> [!NOTE]
> As HTML attributes are case-insensitive, corresponding properties can be written as follows:
> ```html
> <img src="..." &naturalwidth="width" &naturalheight="height" />
> ```


> [!NOTE]
> The `naturalWidth` and `naturalHeight` properties are read-only and reflect the original image dimensions, available after the image has loaded.


### Binding `<video>` sizes

You can bind the `videoWidth` and `videoHeight` properties of a video after it loads:

```html
<video &videoWidth="width" &videoHeight="height">
  <source src="..." type="video/mp4">
</video>
```
🚀 [Live demo | Alpine.js x-bound: Binding video sizes](https://jsfiddle.net/rameel/nah2pfcx/)


### Binding `contenteditable` elements

For `contenteditable` elements, you can bind the following properties:
- [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [innerText](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
- [textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

```html
<div &innerHtml="html" contenteditable="true"></div>
```
🚀 [Live demo | Alpine.js x-bound: Contenteditable bindings](https://jsfiddle.net/rameel/n5sj0rdz/)


### Binding block-level element sizes

You can bind to the following properties to get the **width** and **height** of block-level elements,
measured with a `ResizeObserver`. The values will update whenever the element's size changes:

- [clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight)
- [clientWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth)
- [offsetHeight](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight)
- [offsetWidth](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth)

```html
<div &client-width="width" &client-height="height"></div>
```
🚀 [Live demo | Alpine.js x-bound: Binding element dimensions](https://jsfiddle.net/rameel/jc4eu921/)

> [!NOTE]
> These properties are read-only.

> [!IMPORTANT]
> Elements with `display: inline` don't have an explicit width or height (unless they are intrinsically sized, like `<img>` or `<canvas>`). Therefore, a `ResizeObserver` cannot track their size. If you need to observe their size, change their `display` style to something like `inline-block`.
>
> Also keep in mind that CSS transforms do not trigger `ResizeObserver` updates.


### Binding group of `<input type="radio">` and `<input type="checkbox">`
The group of `<input>` elements that should function together can utilize the `group` bound property.

```html
<div x-data="{ pets: ['goldfish', 'parrot'], contact: 'Email' }">

  <!-- grouped checkboxes are similar to "select multiple"
       and use an array for selected options -->
  <input &group="pets" type="checkbox" value="cat" />
  <input &group="pets" type="checkbox" value="goldfish" />
  <input &group="pets" type="checkbox" value="parrot" />
  <input &group="pets" type="checkbox" value="spider" />

  <!-- grouped radio inputs are mutually exclusive -->
  <input &group="contact" type="radio" value="Email" />
  <input &group="contact" type="radio" value="Phone" />
  <input &group="contact" type="radio" value="Mail" />

</div>
```
🚀 [Live demo | Alpine.js x-bound: Binding element dimensions](https://jsfiddle.net/rameel/f5jpry7b/)


### Binding `input[type="checkbox"]:indeterminate` property
The `x-bound` directive supports binding the `indeterminate` property of `<input type="checkbox">` elements,
allowing you to control the checkbox's indeterminate state (a state where the checkbox is neither checked nor unchecked,
typically represented visually with a dash or similar indicator).

```html
<div x-data="{ checked: false, indeterminate: true }">
  <input type="checkbox" &checked &indeterminate />

  <template x-match>
    <span x-case="indeterminate">Waiting...</span>
    <span x-case="checked">Checked</span>
    <span x-default>Unchecked</span>
  </template>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Binding indeterminate](https://jsfiddle.net/rameel/o8ubzac0/)

This is useful for scenarios like selecting a subset of items in a list, such as in a table header checkbox:
```html
<table>
  <thead>
    <tr>
      <th>
        <input type="checkbox"
               &indeterminate="isPartialSelected"
               &checked="isAllSelected" />
      </th>
      <th>Value</th>
    </tr>
  </thead>
  ...
</table>
```
🚀 [Live demo | Alpine.js x-bound: Binding indeterminate (table)](https://jsfiddle.net/rameel/ryvhw3jt/)

In this example, the `indeterminate` property of the checkbox is bound to the `isPartialSelected` data property.
When `isPartialSelected` is `true`, the checkbox will be in the indeterminate state.

> [!NOTE]
> The `indeterminate` binding is one-way. Changes to the indeterminate property in the DOM (e.g., via user interaction or programmatically) do not update the bound data property.

### Binding `Alpine` data properties

The directive also supports synchronizing values between two data properties.

```html
<div x-data="{ number: 5 }">
    <div x-data="{ count: 0 }" &count="number">
        <button @click="count++">Increment</button>
    </div>

    Number: <span x-text="number"></span>
</div>
```
🚀 [Live demo | Alpine.js x-bound: Binding data properties](https://jsfiddle.net/rameel/972qyomn/)

In this example, we bind the outer `number` property to the inner `count` property. Since `number` is initially set to `5`,
the `count` property is also set to `5` when the binding occurs.

By default, the binding is two-way, so changes in `count` are reflected in `number` and vice versa.

But what if we want changes to propagate in one direction only? For this case, the `x-bound` directive
provides three modifiers to control data flow:

> [!TIP]
> - **`inout`**: Binding works in both directions. This means that changes in one property are automatically reflected in the other and vice versa. This modifier is used by default.
>
>   Example: If we have the property `&count="number"`, then changing the value of `count` will also change the value of `number`, and vice versa.
>
> - **`in`**: Binding works in one direction only — from the source property to the target property. This means that changes in the source property are passed to the target property, but changes in the target property do not affect the source property.
>
>   Example: If we have `&count.in="number"`, then changes in `number` will be passed to `count`, but changes in `count` will not be reflected in `number`.
>
> - **`out`**: Binding works in one direction only — from the target property to the source property. This means that changes in the target property are passed to the source property, but changes in the source property do not affect the target property.
>
>   Example: If we have `&count.out="number"`, then changes in `count` will be passed to `number`, but changes in `number` will not be reflected in `count`.

> [!NOTE]
> The default behavior (`inout`) can also be achieved using the `x-model` and `x-modelable` directives.


## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound


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
