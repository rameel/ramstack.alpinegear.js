# @ramstack/alpinegear-template
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-template)](https://www.npmjs.com/package/@ramstack/alpinegear-template)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

`@ramstack/alpinegear-template` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-template` directive.

This directive allows you to define a template once anywhere in the DOM and reference it by its ID.

This helps avoid duplicating templates, simplifying markup and making it easier to manage.

Moreover, it enables recursive templates, allowing you to create components like a **tree view** with ease,
something that would otherwise be quite complex to implement.

> [!Note]
> This package is part of the **[`@ramstack/alpinegear-main`](https://www.npmjs.com/package/@ramstack/alpinegear-main)** bundle.
> If you are using the main bundle, you don't need to install this package separately.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-template@1/alpinegear-template.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-template
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import template from "@ramstack/alpinegear-template";

Alpine.plugin(template);
Alpine.start();
```

## Usage
Here's a simple example where the template definition is separated from the main markup:

```html
<template id="columns-template">
  <td x-text="item.name"></td>
  <td x-text="item.description"></td>
</template>

<div x-data="{
  items: [
    { name: 'Star', description: 'Luminous plasma sphere.' },
    { name: 'Planet', description: 'Body orbiting a star.' },
    { name: 'Galaxy', description: 'Stars and dust system.' },
    { name: 'Nebula', description: 'Cloud of gas in space.' }
  ]}">
  <table>
    <template x-for="item in items" :key="item.text">
      <tr x-template="columns-template"></tr>
    </template>
  </table>
</div>
```
🚀 [Live demo | Alpine.js x-template: External template](https://jsfiddle.net/rameel/20boy7rq/)

In this example, the table column template is extracted into a separate template (`columns-template`),
which is referenced inside the loop.

Note that the template uses the data context available at the point where it's referenced,
as if it was defined in place.

> [!TIP]
> You can use multiple root elements inside a given template.

> [!IMPORTANT]
> * Templates should be defined using the `<template>` tag with a unique ID.
> * The `x-template` directive can only be applied to non-`<template>` elements.

### Recursive Template

Since you can reference a template within itself by ID, it becomes easy to render **tree-like** structures – an otherwise challenging task.

Here's an example of rendering a simple file tree using `<ul>` tags:

```html
<template id="treeitem">
  <span x-text="model.name"></span>

  <template x-if="model.list">
    <ul>
      <template x-for="item in model.list">
        <!-- Recursively apply the current template to render nested items -->
        <li x-template="treeitem" x-data="{ model: item }"></li>
      </template>
    </ul>
  </template>
</template>

<ul x-data="json">
  <li x-template="treeitem"></li>
</ul>

<script>
  const json = {
    model: {
      name: 'root',
      list: [
        {
          name: 'Documents',
          list: [
            { name: 'Resume.docx' },
            { name: 'CoverLetter.docx' }
          ]
        },
        {
          name: 'Pictures',
          list: [
            {
              name: 'Nature',
              list: [
                { name: 'Mountains.jpg' },
                { name: 'River.jpg' }
              ]
            }
          ]
        }
      ]
    }
  };
</script>
```
🚀 [Live demo | Alpine.js x-template: Recursive template (tree rendering)](https://jsfiddle.net/rameel/8envy4o7/)

This will generate the following HTML structure:

* root
  * Documents
    * Resume.docx
    * CoverLetter.docx
  * Pictures
    * Nature
      * Mountains.jpg
      * River.jpg

As you can see, we are able to render nested elements by recursively referencing the same template within itself,
which opens up a lot of possibilities for complex layouts.

#### Interactive Tree with Recursive Template

Explore another example showcasing a recursive `x-template` to render an interactive tree with expandable folders
and dynamic child addition.

🚀 [Live demo | Alpine.js x-template: Interactive Tree](https://jsfiddle.net/rameel/xwavq1to/)


## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template


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
