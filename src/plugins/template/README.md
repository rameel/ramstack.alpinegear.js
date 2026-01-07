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

## Related projects

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Provides a combined plugin that includes several useful directives.
This package aggregates multiple individual plugins, offering a convenient all-in-one bundle.
Included directives: `x-bound`, `x-format`, `x-fragment`, `x-match`, `x-template`, and `x-when`.

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

**[@ramstack/alpinegear-format](https://www.npmjs.com/package/@ramstack/alpinegear-format)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/format))<br>
Provides the `x-format` directive, which allows you to easily interpolate text using a template syntax similar to what's available in `Vue.js`.

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

**[@ramstack/alpinegear-dialog](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog))<br>
Provides a headless dialog directive for Alpine.js based on the native HTML `<dialog>` element.
It supports declarative composition, value-based close semantics, and both modal and non-modal dialogs,
with optional Promise-based imperative control.


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
