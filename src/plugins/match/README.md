# @ramstack/alpinegear-match

`@ramstack/alpinegear-match` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-match` directive.

This directive functions similarly to the `switch` statement in many programming languages, allowing you to conditionally render elements based on matching cases.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-when@1/alpinegear-match.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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
The `x-match` directive is similar to using multiple consecutive `x-if` or `x-when` directives. However, using multiple `x-if` or `x-when` can make your markup harder to read and lead to code bloat.

The `x-match` directive provides a cleaner solution by allowing you to define multiple blocks with conditions. The corresponding block will be displayed if its condition evaluates to true.

Here's a simple example solving the classic **FizzBuzz** game:
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

While it's possible to wrap the loop's content in an additional `<div>` (since `x-for` only allows a single root element), or use a plugin like [@ramstack/alpinegear-fragment](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment), to achieve similar results, the `x-match` directive provides a much cleaner and more readable approach. Additionally, it avoids introducing extra elements that are only needed to bypass these limitations.

For comparison, here's how the same **FizzBuzz** game might look using `x-fragment`:

```html
<div x-data="{ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] }">
    <template x-for="n in numbers">
        <div>
            <template x-if="n % 3 == 0 && n % 5 == 0">
                <div>Fizz Buzz</div>
            </template>
            <template x-if="n % 3 == 0">
                <div>Fizz</div>
            </template>
            <template x-if="n % 5 == 0">
                <div>Buzz</div>
            </template>
            <template x-if="n % 3 != 0 && n % 5 != 0">
                <div x-text="n"></div>
            </template>
        </div>
    </template>
</div>
```

> [!IMPORTANT]
> Ensure that `x-case` conditions are ordered from most specific to least specific. Otherwise, a more general case might intercept the condition, causing subsequent cases not to execute.

> [!NOTE]
> The `x-default` branch is optional and only renders if none of the `x-case` conditions evaluate to `true`.

> [!TIP]
> The `x-case` directive can be applied to regular HTML tags or `<template>` tags. When used with `<template>`, you can define multiple root elements, and all will be rendered.


## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/match

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
