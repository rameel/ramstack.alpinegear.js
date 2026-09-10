# @ramstack/alpinegear-safehtml

`@ramstack/alpinegear-safehtml` provides the `x-safehtml` Alpine.js directive. It renders reactive HTML after sanitizing it with DOMPurify's default configuration.

> [!NOTE]
> This package is included in `@ramstack/alpinegear-main`.

## Installation

### Using CDN

Include the plugin before Alpine.js:

```html
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-safehtml@1/alpinegear-safehtml.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM

```bash
npm install --save @ramstack/alpinegear-safehtml
```

```js
import Alpine from "alpinejs";
import safehtml from "@ramstack/alpinegear-safehtml";

Alpine.plugin(safehtml);
Alpine.start();
```

## Usage

```html
<div x-data="{ content: '<p>Hello <strong>world</strong></p>' }">
  <div x-safehtml="content"></div>
</div>
```

Whenever `content` changes, the directive sanitizes the new value before replacing the element's contents.

## License

This package is released under the MIT License.
