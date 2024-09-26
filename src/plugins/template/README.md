# @ramstack/alpinegear-template

`@ramstack/alpinegear-template` is a plugin for [Alpine.js](https://alpinejs.dev/) that provides the `x-template` directive.

This directive allows you to define a template once anywhere in the DOM and reference it by its ID.

This helps avoid duplicating templates, simplifying markup and making it easier to manage.

Moreover, it enables recursive templates, allowing you to create components like a **tree view** with ease,
something that would otherwise be quite complex to implement.

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-template@1/alpinegear-template.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
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
    <td x-text="item.id"></td>
    <td x-text="item.name"></td>
    <td x-text="item.description"></td>
</template>

<div x-data="{
    items: [
        { id: 1, name: 'Item 1', description: 'Description 1' },
        { id: 2, name: 'Item 2', description: 'Description 2' },
        { id: 3, name: 'Item 3', description: 'Description 3' } ]
    }">
    <table>
        <template x-for="item in items" :key="item.id">
            <tr x-template="columns-template"></tr>
        </template>
    </table>
</div>
```

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

Since you can reference a template within itself by ID, it becomes easy to render **tree-like** structures -
an otherwise challenging task.

Here's an example of rendering a simple file tree using `<ul>` tags:

```html
<template id="treeitem">
    <span x-format>{{ model.name }}</span>

    <template x-if="model.list">
        <ul>
            <template x-for="item in model.list">
                <li x-template="treeitem" x-data="{ model: item }"></li>
            </template>
        </ul>
    </template>
</template>

<ul x-data="json">
    <li x-template="treeitem"></li>
</ul>
```
```js
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
```

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

## Source code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
