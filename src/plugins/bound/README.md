# @ramstack/alpinegear-bound

`@ramstack/alpinegear-bound` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-bound` directive.

This directive allows for two-way binding between input elements and their associated data properties. It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property) and also supports synchronizing values between two `Alpine.js` data properties.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-bound@1/alpinegear-bound.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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

In this example, we bind the `name` property to the `value` property of the `<input>` element. Since `x-bound` provides two-way binding, any changes to `name` will be reflected in the `<input>` element, as will occur when the `button` is clicked.

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

In this example, the repetition of the `value` in `x-bound:value="value"` is redundant, so we can simply shorten it to `<input x-bound:value>`. Since we can use `&` instead of `x-bound`, the example can be written as follows:

```html
<input &value />
```

More examples:

```html
<div x-data="{ name: '', text: '', yes: true }">
    <input &value="name" />
    <textarea &value="text"></textarea>
    <input &checked="yes" type="checkbox" />
</div>
```

### Binding Numeric Inputs

For `<input>` elements with `type="number"` and `type="range"`, values are automatically coerced into numbers. If the `<input>` value is empty or invalid, the bound property will be set to `null`.

```html
<input &value="number" type="number" />
```

### Binding `<input type="file">`

For `<input>` elements with `type="file"`, the binding is applied to the `files` property, resulting in a [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) object being assigned, containing the list of selected files.

```html
<input &files type="file" accept="image/jpeg" />
```

> [!NOTE]
> The `files` binding is one-way.

### Binding `<select>`

To bind the value of a `<select>` element, use the `value` property:
```html
<select &value="pet">
  <option value="cat">Cat</option>
  <option value="goldfish">Goldfish</option>
  <option value="parrot">Parrot</option>
</select>
```

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

### Binding `<details>`

The directive also allows binding to the `open` property of `<details>` elements:

```html
<details &open="isOpen">
    <summary>Details</summary>
    <p>Something small enough to escape casual notice.</p>
</details>
```

### Binding `<img>` sizes

You can bind the `naturalWidth` and `naturalHeight` properties of an image after it loads:

```html
<img src="..." &naturalWidth="width" &naturalHeight="height" />
```

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


### Binding `contenteditable` elements

For `contenteditable` elements, you can bind the following properties:
- [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
- [innerText](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
- [textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)

```html
<div &inner-html="html" contenteditable="true"></div>
```

### Binding block-level element sizes

You can bind to the following properties to get the **width** and **height** of block-level elements. The values will update whenever the element's size changes:

- [clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight)
- [clientWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth)
- [offsetHeight](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight)
- [offsetWidth](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth)

```html
<div &client-width="width" &client-height="height"></div>
```

> [!NOTE]
> These properties are read-only.

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

In this example, we bind the outer `number` property to the inner `count` property. Since `number` is initially set to `5`, the `count` property is also set to `5` when the binding occurs.

By default, the binding is two-way, so changes in `count` are reflected in `number` and vice versa.

But what if we want changes to propagate in one direction only? For this case, the `x-bound` directive provides three modifiers to control data flow:

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

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
