# Ramstack.AlpineGear.js
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-main)](https://www.npmjs.com/package/@ramstack/alpinegear-main)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)


**`Ramstack.AlpineGear.js`** provides useful and convenient plugins for [Alpine.js](https://alpinejs.dev/).

## Included Plugins

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties. It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property) and also supports synchronizing values between two `Alpine.js` data properties.

```html
<div x-data="{ width: 0, height: 0, files: [] }">
  <input &files="files" type="file" accept="image/jpeg" />

  <img &naturalwidth="width" &naturalheight="height" src="..." />

  ...
  For other examples, see README
</div>
```


**[@ramstack/alpinegear-format](https://www.npmjs.com/package/@ramstack/alpinegear-format)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/format))<br>
Provides `x-format` directive, which allows you to easily interpolate text using a template syntax similar to what's available in `Vue.js`.

```html
<div x-data="{ message: 'Hello, World!'}" x-format>
  <span>Message: {{ message }}</span>
</div>
```


**[@ramstack/alpinegear-template](https://www.npmjs.com/package/@ramstack/alpinegear-template)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template))<br>
Provides `x-template` directive, allowing to define a template once anywhere in the DOM and reference it by its ID.

This helps avoid duplicating templates, simplifying markup and making it easier to manage.

Moreover, it enables recursive templates, allowing you to create components like a **tree view** with ease,
something that would otherwise be quite complex to implement.

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


**[@ramstack/alpinegear-fragment](https://www.npmjs.com/package/@ramstack/alpinegear-fragment)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/fragment))<br>
Provides the `x-fragment` directive, allowing for fragment-like behavior similar to what's available in frameworks like `Vue.js` or `React`, where multiple root elements can be grouped together.

It is particularly useful when you want to avoid wrapping elements in unnecessary container tags.

```html
<dl>
  <template x-for="item in items" :key="item.term">
    <template x-fragment>
      <dt x-text="item.term"></dt>
      <dd x-text="item.description"></dd>
    </template>
  </template>
</dl>
```


**[@ramstack/alpinegear-match](https://www.npmjs.com/package/@ramstack/alpinegear-match)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/match))<br>
Provides the `x-match` directive, which functions similarly to the `switch` statement in many programming languages, allowing to conditionally render elements based on matching cases.

```html
<template x-for="n in numbers">
  <template x-match>
    <div x-case="n % 3 == 0 && n % 5 == 0">Fizz Buzz</div>
    <div x-case="n % 3 == 0">Fizz</div>
    <div x-case="n % 5 == 0">Buzz</div>
    <div x-default x-text="n"></div>
  </template>
</template>
```


**[@ramstack/alpinegear-when](https://www.npmjs.com/package/@ramstack/alpinegear-when)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/when))<br>
Provides the `x-when` directive, which allows for conditional rendering of elements similar to `x-if`, but supports multiple root elements.

```html
<template x-for="item in items" :key="item.term">
  <template x-when="item.visible">
    <dt x-text="item.term"></dt>
    <dd x-text="item.description"></dd>
  </template>
</template>
```


**[@ramstack/alpinegear-hotkey](https://www.npmjs.com/package/@ramstack/alpinegear-hotkey)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/hotkey))<br>
Provides the `x-hotkey` directive, allowing easily handle keyboard shortcuts.

```html
<div x-hotkey.shift+f.window="console.log($event.hotkey)">
  Hello, World!
</div>
```


**[@ramstack/alpinegear-router](https://www.npmjs.com/package/@ramstack/alpinegear-router)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router))<br>
Provides routing-related directives, enabling client-side navigation and routing functionality.

```html
<div x-data x-router:hash>
  <h1>Hello World!</h1>

  <div>
    <b>Current route:</b>
    <pre x-format>{{ JSON.stringify($route, null, 2) }}</pre>
  </div>

  <!-- Inline template -->
  <template x-route="/">
    Home page
  </template>

  <!-- External template -->
  <template x-route="/about" x-route:view="/views/about.html"></template>

  <nav>
    <a x-router:link href="/">Home</a>
    <a x-router:link.replace href="/about">About</a>
  </nav>

  <!-- Render the matching route -->
  <main x-router:outlet></main>
</div>
```

**[@ramstack/alpinegear-dialog](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog))<br>
Provides a headless dialog directive, built on the native HTML `<dialog>` element.
It enables declarative composition of modal and non-modal dialogs with value-based close semantics,
Promise-based imperative control, and seamless integration with htmx.

```html
<div x-dialog:modal
     @close:yes="console.log('Confirmed')"
     @close="console.log('Closed with', $event.detail.value)">

  <button x-dialog:trigger>Delete</button>

  <dialog x-dialog:panel>
    Are you sure you want to delete this item?

    <div>
      <button x-dialog:action value="yes">Yes</button>
      <button x-dialog:action>Cancel</button>
    </div>
  </dialog>
</div>
```

**[@ramstack/alpinegear-destroy](https://www.npmjs.com/package/@ramstack/alpinegear-destroy)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/destroy))<br>
Provides `x-destroy` provides directive, which is the opposite of `x-init` and allows you to execute code when an element is removed from the DOM.

```html
<template x-if="show">
  <div x-destroy="destroyed = true">
    <p>Hello, World!</p>
  </div>
</template>
```

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Is a combined plugin that includes several directives, providing a convenient all-in-one package.


## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
