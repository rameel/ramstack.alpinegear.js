# @ramstack/alpinegear-safehtml

`@ramstack/alpinegear-safehtml` provides the `x-safehtml` Alpine.js directive.
It renders reactive HTML after sanitizing it with DOMPurify.

DOMPurify is a peer dependency and is not bundled with the plugin.

## Installation

### Using CDN

Include DOMPurify before the plugin, and the plugin before Alpine.js:

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-safehtml@1/alpinegear-safehtml.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

If DOMPurify is already loaded on the page, reuse it instead of adding another script.

### Using NPM

```bash
npm install --save @ramstack/alpinegear-safehtml dompurify@3
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

The sanitized content is treated as plain HTML. Each top-level element is marked with the current Alpine `x-ignore` attribute
and ignored immediately, so Alpine does not initialize its subtree even if `Alpine.initTree()` is called later.

Attributes disallowed by DOMPurify are removed normally. If trusted configuration such as `ADD_ATTR` preserves an Alpine directive
or a custom `mapAttributes` shorthand, `x-ignore` keeps it inert.

## Configuration

The plugin creates a private DOMPurify instance when it is registered with Alpine.
Calls to `DOMPurify.setConfig()` or `DOMPurify.addHook()` on the application's instance do not affect the plugin,
and the plugin does not change the application's configuration or hooks.
The library code is shared; only the instance state is separate.

Global DOMPurify options can be declared in a `meta` element:

```html
<meta
  name="alpinegear-safehtml-options"
  content='{ "USE_PROFILES": { "html": true }, "FORBID_ATTR": ["style"] }'
>
```

Options for an individual element can be provided with `data-safehtml-options`:

```html
<div
  x-safehtml="content"
  data-safehtml-options='{ "FORBID_TAGS": ["img"] }'
></div>
```

Both settings are static JSON objects read when the directive is initialized.
Element options override global options using a shallow merge,
so arrays and nested objects are replaced rather than combined.

> [!WARNING]
> Configuration must come from trusted application markup.
> Options that change DOMPurify's return type (`IN_PLACE`, `RETURN_DOM`, and `RETURN_DOM_FRAGMENT`) are always disabled.

## License

This package is released under the MIT License.
