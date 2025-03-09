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
    <a x-router:link href="/about">About</a>
  </nav>

  <!-- Render the matching route -->
  <main x-router:outlet></main>
</div>
```

## Inline and External Templates
Routes can be defined using either **inline templates** or **external templates**:

- **Inline templates**: The content of the route is directly written inside the `<template>` element.
  ```html
  <template x-route="/">
    Home page
  </template>
  ```

- **External templates**: The content of the route is loaded from an external HTML file specified in the `x-route:view` attribute.
  ```html
  <template x-route="/about" x-route:view="/views/about.html"></template>
  ```
  This method is useful for keeping templates separate and organized.

## History Modes
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

## Route Directive
Routes are defined using a `<template>` element with the `x-route` attribute.

```html
<div x-router>
  <template x-route="/">
    Home page
  </template>

  <!-- External template -->
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

## Outlet Directive

The `x-router:outlet` directive is used to render the matching route's content and can be placed anywhere
within an `x-router` element. If no route matches, `x-router:outlet` will render nothing.

```html
<div x-router>
  <template x-route="/">
    Home page
  </template>

  <!-- External template -->
  <template x-route="/profile/{username}">
    Profile
  </template>

  <!-- Render the matching route -->
  <div x-router:outlet></div>
</div>
```

## Link Directive

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

## Magic Functions

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
Returns `true` or `false`, indicating whether a link corresponds to the active route.

```html
<nav>
  <a x-router:link href="/" class="{ link__active: $active }">Home</a>
  <a x-router:link href="/about" class="{ link__active: $active }">About</a>
</nav>
```

## Source Code
You can find the source code for this plugin on GitHub:

https://github.com/rameel/ramstack.alpinegear.js/tree/main/src/plugins/router

## Contributions
Bug reports and contributions are welcome.

## License
This package is released as open source under the **MIT License**.
See the [LICENSE](https://github.com/rameel/ramstack.alpinegear.js/blob/main/LICENSE) file for more details.
