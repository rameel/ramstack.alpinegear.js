# @ramstack/alpinegear-format
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-format)](https://www.npmjs.com/package/@ramstack/alpinegear-format)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-format` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-format` directive.

This directive allows you to easily interpolate text using a template syntax similar to what's available in `Vue.js`.

> [!Note]
> This package is part of the **[`@ramstack/alpinegear-main`](https://www.npmjs.com/package/@ramstack/alpinegear-main)** bundle.
> If you are using the main bundle, you don't need to install this package separately.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-format@1/alpinegear-format.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
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
    <p>{{ message }}</p>
  </template>
</div>
```

To ensure proper interpolation, include the `x-format` directive in the dynamically rendered elements:

```html
<div x-data="{ show: false, message: 'Hello, World!' }">
  <input x-model="message" />

  <label>
    <input type="checkbox" x-model="show" />
    Show message
  </label>

  <template x-if="show">
    <p x-format>{{ message }}</p>
  </template>
</div>
```
🚀 [Live demo | Alpine.js x-format: Dynamic elements](https://jsfiddle.net/rameel/1s8pwcx9/)

## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/format


## Related projects

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Provides a combined plugin that includes several useful directives.
This package aggregates multiple individual plugins, offering a convenient all-in-one bundle.
Included directives: `x-bound`, `x-format`, `x-fragment`, `x-match`, `x-template`, and `x-when`.

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

**[@ramstack/alpinegear-template](https://www.npmjs.com/package/@ramstack/alpinegear-template)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template))<br>
Provides the `x-template` directive, which allows you to define a template once anywhere in the DOM and reference it by its ID.

**[@ramstack/alpinegear-fragment](https://www.npmjs.com/package/@ramstack/alpinegear-fragment)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment))<br>
Provides the `x-fragment` directive, which allows for fragment-like behavior similar to what's available in frameworks
like `Vue.js` or `React`, where multiple root elements can be grouped together.

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


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
