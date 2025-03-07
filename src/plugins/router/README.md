# @ramstack/alpinegear-router
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-router)](https://www.npmjs.com/package/@ramstack/alpinegear-router)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-router` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides routing-related directives
for Alpine.js, enabling client-side navigation and routing functionality.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-router@1/alpinegear-router.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-router
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import router from "@ramstack/alpinegear-router";

Alpine.plugin(router);
Alpine.start();
```

## Usage

```html
<div x-data x-router>
  <template x-route="/">
    Main page
  </template>

  <template x-route="/article/{id?:int}">
    <div x-format>
      Article #{{ $route.params.id }}
    </div>
  </template>

  <template x-route="/about" x-route:view="/views/about-us.html"></template>

  <nav>
    <a x-router:link href="/" :class="{'active': $active }">Main</a>
    <a x-router:link href="/article/123" :class="{'active': $active }">What is routing?</a>
    <a x-router:link href="/about" :class="{'active': $active }">About Us</a>
  </nav>

  <div x-router:outlet></div>
</div>
```

## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
