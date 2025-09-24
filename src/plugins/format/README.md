# @ramstack/alpinegear-format
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-format)](https://www.npmjs.com/package/@ramstack/alpinegear-format)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-format` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-format` directive.

This directive allows you to easily interpolate text using a template syntax similar to what's available in `Vue.js`.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-format@1/alpinegear-format.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-format
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import format from "@ramstack/alpinegear-format";

Alpine.plugin(format);
Alpine.start();
```

## Usage
The `x-format` directive enables you to use double curly braces (`{{ ... }}`) to evaluate expressions
and inject their values into the DOM. The expressions within placeholders can be any valid JavaScript expression,
such as variables, arithmetic operations, or function calls, as long as they are available in the Alpine.js scope.

```html
<div x-data="{ message: 'Hello, World!' }" x-format>
  <input x-model="message" />

  <p>
    Message: {{ message || "Empty" }}
  </p>
</div>
```
🚀 [Live demo | Alpine.js x-format: Interpolate expression](https://jsfiddle.net/rameel/68nv4Ldg/)

In this example, `{{ message || "Empty" }}` will be replaced by the evaluated result, and the content
will update whenever the `message` property change.

### Using with Attributes
The `x-format` directive can also be used to interpolate values inside HTML attributes:

```html
<div x-data="{ message: 'Hello, World!' }" x-format>
  <input x-model="message" />

  <p title="Message: {{ message }}">
    Message: {{ message }}
  </p>
</div>
```
🚀 [Live demo | Alpine.js x-format: Interpolate expression](https://jsfiddle.net/rameel/68nv4Ldg/)

Just like with text interpolation, the attribute values will be updated automatically when the data changes.

> [!IMPORTANT]
> The `x-format` directive treats evaluated expressions as plain text, not HTML, ensuring safe rendering and preventing injection attacks like XSS.
>
> If you need to render HTML, use the `x-html` directive instead.


> [!WARNING]
> Keep in mind that interpolation within a `<textarea>` element may not work as you expect.
>
> Use `x-model` instead.

### Using `once` modifier
The `once` modifier allows you to interpolate the expression only once.
After the initial rendering, the content remains static and will not update, even if the data changes.

```html
<div x-data="{ message: 'Hello, World!'}" x-format.once>
  <input x-model="message" />
  <p>
    {{ message }}
  </p>
</div>
```
🚀 [Live demo | Alpine.js x-format: Interpolate expression only once](https://jsfiddle.net/rameel/ckfeLpj8/)


## Optimization
The `x-format` directive is optimized to update only the parts of the text that change,
without replacing the entire DOM element. This is especially useful for large or complex DOM structures.

For example:
```html
<div x-data="{ message: 'Hello, World!'}" x-format>
  The 'message' value is '{{ message }}' and it updates when the property changes.
</div>
```

In this case, the text will be split into three separate text nodes:
1. `The 'message' value is '`
2. `{{ message }}`
3. `' and it updates when the property changes.`

Only the `{{ message }}` text node will be updated, while the static nodes will remain unchanged.

> [!NOTE]
> This optimization does not apply to attribute values.


## Dynamic Elements
Since the `x-format` directive doesn't automatically track changes to the DOM,
newly added elements (e.g., via `x-if` or `x-for`) will not automatically interpolate their templates.

For instance, in the example below, the `{{ message }}` inside `x-if` remains unchanged:

```html
<div x-data="{ show: false, message: 'Hello, World!'}" x-format>
  <template x-if="show">
    <span>{{ message }}</span>
  </template>
</div>
```

To ensure proper interpolation, include the `x-format` directive in the dynamically rendered elements:

```html
<div x-data="{ show: false, message: 'Hello, World!'}">
    <template x-if="show">
        <span x-format>{{ message }}</span>
    </template>
</div>
```

## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/format

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
