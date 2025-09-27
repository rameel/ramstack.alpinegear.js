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
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
```

### Using NPM
Alternatively, you can install the plugin via `npm`:

```bash
npm install --save @ramstack/alpinegear-router
```

Then, initialize it in your project:

```js
import Alpine from "alpinejs";
import router from "@ramstack/alpinegear-router";

Alpine.plugin(router);
Alpine.start();
```

## Usage

```html
<div x-data x-router>
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
🚀 [Live demo | Alpine.js x-router: Basic example](https://jsfiddle.net/rameel/h9mygjcd/)<br />
🚀 [Live demo | Alpine.js x-router: Nested router](https://jsfiddle.net/rameel/rwkxapnu/)

## History modes
The router can be configured to use different history modes. There are two available modes:
* `html5`: The default history mode.
* `hash`: Uses a hash `#` in the URL to manage history.

### HTML5 mode
The `html5` mode uses the browser's history API to manage navigation.

```html
<div x-data x-router:html5>
  ...
</div>
```

Since this mode is the default, there is no need to specify it explicitly:

```html
<!-- HTML5 mode is used by default -->
<div x-data x-router>
  ...
</div>
```

### Hash mode
This mode uses a hash `#` in the URL to handle navigation. Unlike `html5` mode, it requires no special server-side
configuration since the browser does not send the hash portion of the URL to the server.
```html
<div x-data x-router:hash>
  ...
</div>
```

## Route directive
Routes are defined using a `<template>` element with the `x-route` attribute.

```html
<div x-router>
  <template x-route="/">
    Home page
  </template>

  <template x-route="/profile/{username}">
    Profile
  </template>

  <!-- Render the matching route -->
  <div x-router:outlet></div>
</div>
```

In this example, two routes are defined: a static `/` route representing the homepage,
and a dynamic (parameterized) route `/profile/{username}`, where `username` is a route parameter enclosed
in curly brackets.

This means that URLs like `/profile/john` and `/profile/samantha` will both match the same route.
When a route is matched, the `username` parameter can be accessed via `$route.params.username`.

For more details on dynamic (parameterized) routes, refer to the corresponding section below.

## Outlet directive

The `x-router:outlet` directive is used to render the matching route's content and can be placed anywhere
within an `x-router` element. If no route matches, `x-router:outlet` will render nothing.

```html
<div x-router>
  <template x-route="/">
    Home page
  </template>

  <template x-route="/profile/{username}">
    Profile
  </template>

  <!-- Render the matching route -->
  <div x-router:outlet></div>
</div>
```

## Link directive

```html
<div x-router:hash>
  ...
  <nav>
    <a x-router:link href="/">Home</a>
    <a x-router:link href="/about">About</a>
  </nav>
</div>
```

The router does not automatically intercept all links. Only links with the `x-router:link` directive
inside an `x-router` container are handled by the router. Links should always be specified normally,
regardless of the selected history mode.

### Applying `x-router:link` to parent elements

You can also apply `x-router:link` to parent elements, such as `<li>`, to enable more flexible markup structures:
```html
<li x-router:link :class="{ active: $active }">
   <a href="/about">About</a>
</li>
```

In this case:
* `x-router:link` will locate the nested `<a>` element within the parent and use its `href` for routing.
* The `$active` state will correctly reflect whether the nested link's `href` matches the current route.

### Modifier `replace`

The `replace` modifier changes the default navigation behavior of the router. When a link with this modifier is clicked,
it triggers `$router.navigate(href, /* replace */ true)`.

Unlike the default behavior, which adds a new entry to the browser's history stack, this option replaces
the current history entry with the new URL. As a result, the user's navigation history remains unchanged,
and pressing the **"Back"** button will skip over the replaced entry.

```html
<div x-router:hash>
  ...
  <nav>
    <a x-router:link href="/">Home</a>
      <!-- The "replace" modifier ensures that clicking this link
           replaces the current history entry instead of adding a new one -->
    <a x-router:link.replace href="/about">About</a>
  </nav>
</div>
```

## Inline and External templates
Routes can be defined using either **inline templates** or **external templates**:

**Inline templates:**<br />
The content of the route is directly written inside the `<template>` element.
```html
<template x-route="/">
  Home page
</template>
```

**External templates:**<br />
The content of the route is loaded from an external HTML file specified in the `x-route:view` directive.
```html
<template x-route="/about" x-route:view="/views/about.html"></template>
```

## Magic functions

### Magic `$route`
Indicates the current active route and contains the following properties:

```html
<dl x-format>
  <dt>Route pattern:</dt>
  <dd>{{ $route.pattern }}</dd>

  <dt>Route path:</dt>
  <dd>{{ $route.path }}</dd>

  <dt>Route params:</dt>
  <dd>{{ $route.params.username }}</dd>
</dl>
```

### Magic `$active`
Returns `true` or `false`, indicating whether a `x-router:link` corresponds to the active route.

```html
<nav>
  <a x-router:link href="/" class="{ active: $active }">Home</a>
  <a x-router:link href="/about" class="{ active: $active }">About</a>
</nav>
```

#### Applying active class to parent element

```html
<li x-router:link :class="{ active: $active }">
   <a href="/about">About</a>
</li>
```
The `$active` state will correctly reflect whether the nested link's `href` matches the current route.

## Route templates

Routes can contain parameters enclosed in `{}` that are dynamically bound when a route is matched.
Multiple parameters can be used within a route segment, but they must be separated by a static value. For example:
```
{controller}{action}
```
is invalid because `{controller}` and `{action}` are not separated by a static value.
Instead, valid routes should use static separators:
```
{controller}/{action}
```
```
article/{id}-{title}
```

### Route parameters
Route parameters must have a name and can also include additional attributes.
Literal values and path separators (`/`) must match exactly in the URL. Matching is case-insensitive and based
on the decoded URL representation.

#### Optional and Catch-All Parameters
- **Optional parameters**: Defined with `?`, meaning they are not required. Example: `{id?}`
- **Catch-all parameters** (`*`): Capture the remaining part of the URL. Example: `blog/{slug*}`
    - Matches any URL starting with `blog/`.
    - The remaining value is assigned to the `slug` parameter.
- **Required catch-all parameters** (`+`): Like `*`, but at least one segment must match.

### Parameter constraints
Route parameters can have constraints to validate and transform values. Constraints are added using `:` after the parameter name.
If a constraint requires arguments, they are placed in parentheses.

Example:
```
blog/{id:int:min(100)}/{article:minlength(10)}
```

- `{id:int:min(100)}` ensures `id` is an integer and at least 100.
- `{article:minlength(10)}` requires `article` to be at least 10 characters long.

Some constraints also transform parameters. For example, `{id:int}` automatically converts `id` to a number.

### Default values
Route parameters can have **default values**, specified similarly to constraints but using `=` or `default`. Example:
```
{controller:=(home)}
```
is equivalent to:
```
{controller:default(home)}
```
If no value is provided in the URL, the default is used.

### Example route patterns

| Route template                                 | URI               | Description                                                   |
|------------------------------------------------|-------------------|---------------------------------------------------------------|
| `hello`                                        | `/hello`          | Matches only `/hello`.                                        |
| `{controller}/{action}/{id?}`                  | `/product/list`   | Matches and sets `controller=product`, `action=list`.         |
| `{controller}/{action}/{id?}`                  | `/product/list/1` | Matches and sets `controller=product`, `action=list`, `id=1`. |
| `{controller:=(home)}/{action:=(index)}/{id?}` | `/`               | Matches and sets `controller=home`, `action=index`.           |
| `{controller:=(home)}/{action:=(index)}/{id?}` | `/product`        | Matches and sets `controller=product`, `action=index`.        |
| `blog/{slug*:=(start/with/new/blog)}`          | `/blog`           | Matches and sets `slug=[start,with,new,blog]`.                |

### Route constraints

| Constraint         | Example                       | Description                                       |
|--------------------|-------------------------------|---------------------------------------------------|
| `int`              | `{id:int}`                    | Matches an integer.                               |
| `bool`             | `{id:bool}`                   | Matches `true` or `false` (case-insensitive).     |
| `number`           | `{speed:number}`              | Matches a valid number.                           |
| `alpha`            | `{name:alpha}`                | Matches alphabetic characters (case-insensitive). |
| `min(value)`       | `{age:min(25)}`               | Ensures the value is at least `25`.               |
| `max(value)`       | `{age:max(125)}`              | Ensures the value is no more than `125`.          |
| `range(min,max)`   | `{age:range(25,125)}`         | Ensures the value is between `25` and `125`.      |
| `length(value)`    | `{file:length(10)}`           | Requires exactly `10` characters.                 |
| `length(min,max)`  | `{file:length(10,20)}`        | Requires between `10` and `20` characters.        |
| `minlength(value)` | `{name:minlength(10)}`        | Requires at least `10` characters.                |
| `maxlength(value)` | `{name:maxlength(50)}`        | Requires no more than `50` characters.            |
| `regex(expr)`      | `{id:regex(^\\d{3}-\\d{5}$)}` | Must match a specific regex pattern.              |


## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router

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


## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.

See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
