# @ramstack/alpinegear-match
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-match)](https://www.npmjs.com/package/@ramstack/alpinegear-match)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-match` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-match` directive.

This directive functions similarly to the `switch` statement in many programming languages,
allowing you to conditionally render elements based on matching cases.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-match@1/alpinegear-match.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-match
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import match from "@ramstack/alpinegear-match";

Alpine.plugin(match);
Alpine.start();
```

## Usage
The `x-match` directive is similar to using multiple consecutive `x-if` or `x-when` directives.
However, using multiple `x-if` or `x-when` can make your markup harder to read and lead to code bloat.

The `x-match` directive provides a cleaner solution by allowing you to define multiple blocks with conditions.
The corresponding block will be displayed if its condition evaluates to true.

Here's a simple example solving the **FizzBuzz** game:
```html
<div x-data="{ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] }">
  <template x-for="n in numbers">
    <template x-match>
      <div x-case="n % 3 == 0 && n % 5 == 0">Fizz Buzz</div>
      <div x-case="n % 3 == 0">Fizz</div>
      <div x-case="n % 5 == 0">Buzz</div>
      <div x-default x-text="n"></div>
    </template>
  </template>
</div>
```
🚀 [Live demo | Alpine.js x-match: FizzBuzz game](https://jsfiddle.net/rameel/5reaopmb/)

While it's possible to wrap the loop's content in an additional `<div>` (since `x-for` only allows a single root element),
to achieve similar results, the `x-match` directive provides a much cleaner and more readable approach.
Additionally, it avoids introducing extra elements that are only needed to bypass these limitations.

> [!IMPORTANT]
> Ensure that `x-case` conditions are ordered from most specific to least specific.
> Otherwise, a more general case might intercept the condition, causing subsequent cases not to execute.

> [!NOTE]
> The `x-default` branch is optional and only renders if none of the `x-case` conditions evaluate to `true`.

> [!TIP]
> The `x-case` directive can be applied to regular HTML tags or `<template>` tags. When used with `<template>`,
> you can define multiple root elements, and all will be rendered.

Here's an example demonstrating the use of `<template>` with `x-case` to render multiple root elements:
```html
<template x-match>
  <template x-case="status === 'active'">
    <h2>Welcome!</h2>
    <p>You have full access to all features.</p>
    <a href="#dashboard">Dashboard</a>
  </template>

  <template x-case="status === 'disabled'">
    <h2>Inactive Account</h2>
    <p>Please activate your account to continue.</p>
  </template>

  <template x-default>
    <h2>Guest Mode</h2>
    <p>Sign up to unlock more features!</p>
    <button>Sign Up</button>
  </template>
</template>
```
🚀 [Live demo | Alpine.js x-match: Multiple root elements](https://jsfiddle.net/rameel/0vLksypo/)

In this example, the `x-match` directive with `<template>` tags allows rendering multiple root elements
(e.g., `<h2>`, `<p>`, `<a>`, and `<button>`) without needing an extra wrapper like a `<div>`.

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/match

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.

