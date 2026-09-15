# @ramstack/alpinegear-markdown

`@ramstack/alpinegear-markdown` provides the `x-markdown` Alpine.js directive.
It renders Markdown with [TanStack Markdown](https://github.com/TanStack/markdown), which is bundled into the plugin.

## Installation

### Using CDN

Include the plugin before Alpine.js:

```html
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-markdown@1/alpinegear-markdown.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM

```bash
npm install --save @ramstack/alpinegear-markdown
```

```js
import Alpine from "alpinejs";
import markdown from "@ramstack/alpinegear-markdown";

Alpine.plugin(markdown);
Alpine.start();
```

## Usage

### Expression

```html
<div x-data="{ content: '# Hello **world**' }">
  <div x-markdown="content"></div>
</div>
```

Whenever `content` changes, the directive renders the new value and replaces the element's contents.

### Element content

Use the `.content` modifier to render the element's own text as Markdown.
The `.static` modifier is an alias:

```html
<div x-markdown.content>
  # Hello

  Some **bold** text
</div>
```

The source is taken from `textContent` once, when the directive is initialized.

The directive must not be used on a `<template>` tag. It also cannot combine an expression with `.content` or `.static` modifier.
In both cases the directive logs a warning and does nothing.

The rendered content is treated as static HTML. Each top-level element is marked with the current Alpine `x-ignore`
attribute and ignored immediately, so Alpine does not initialize its subtree even if `Alpine.initTree()` is called later.

## Configuration

Global TanStack Markdown options can be declared in a `meta` element:

```html
<meta
  name="alpinegear-markdown-options"
  content='{ "allowHtml": true }'
>
```

Options for an individual element can be provided with `data-markdown-options`:

```html
<div
  x-markdown="content"
  data-markdown-options='{ "allowHtml": false }'
></div>
```

Both settings are static JSON objects read when the directive is initialized.
Element options override global options using a shallow merge.

The following options are supported:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `allowHtml` | `boolean` | `false` | Emit raw HTML instead of escaping it |
| `frontmatter` | `boolean` | `true` | Extract a leading `---` frontmatter block |
| `headingIds` | `boolean` | `true` | Generate stable IDs for headings |
| `headingAnchors` | `boolean \| object` | `false` | Append anchor links to headings with IDs |
| `codeLineNumbers` | `boolean` | `false` | Forward the line numbers preference to code blocks |

Any other keys, including non-serializable TanStack Markdown options such as `urlTransform`, `highlighter`, and `extensions`, are ignored.

> [!WARNING]
> `allowHtml: true` is a trusted-content boundary.
> Rendered HTML can contain native event handlers, and the directive only prevents Alpine from initializing the subtree.
> Do not enable it for untrusted user content.

## License

This package is released under the MIT License.
