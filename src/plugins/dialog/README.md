# @ramstack/alpinegear-dialog
[![NPM](https://img.shields.io/npm/v/@ramstack/alpinegear-dialog)](https://www.npmjs.com/package/@ramstack/alpinegear-dialog)
[![MIT](https://img.shields.io/github/license/rameel/ramstack.alpinegear.js)](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE)

## Installation

### Using CDN
To include the CDN version of this plugin, add the following `<script>` tag before the core `alpine.js` file:

```html
<!-- alpine.js plugin -->
<script src="https://cdn.jsdelivr.net/npm/@ramstack/alpinegear-dialog@1/alpinegear-dialog.min.js" defer></script>

<!-- alpine.js -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-dialog
```

Then initialize it in your bundle:

```js
import Alpine from "alpinejs";
import Dialog from "@ramstack/alpinegear-dialog";

Alpine.plugin(Dialog);
Alpine.start();
```

## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/dialog


## Related projects

**[@ramstack/alpinegear-main](https://www.npmjs.com/package/@ramstack/alpinegear-main)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/main))<br>
Provides a combined plugin that includes several useful directives.
This package aggregates multiple individual plugins, offering a convenient all-in-one bundle.
Included directives: `x-bound`, `x-format`, `x-fragment`, `x-match`, `x-template`, and `x-when`.

**[@ramstack/alpinegear-bound](https://www.npmjs.com/package/@ramstack/alpinegear-bound)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/bound))<br>
Provides the `x-bound` directive, which allows for two-way binding of input elements and their associated data properties.
It works similarly to the binding provided by [Svelte](https://svelte.dev/docs/element-directives#bind-property)
and also supports synchronizing values between two `Alpine.js` data properties.

**[@ramstack/alpinegear-template](https://www.npmjs.com/package/@ramstack/alpinegear-template)** ([README](https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/template))<br>
Provides the `x-template` directive, which allows you to define a template once anywhere in the DOM and reference it by its ID.

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


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
