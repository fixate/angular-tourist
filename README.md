angular-tourist
===============

Angular directives to help you show people around your app.

Let's just get something straight right now hmkay :) this module does not give you
a 'plug and play' tour. This module is meant to provide an 'engine' for
setting up a set of steps which trigger your UI.

You will need to:

- code the markup
- setup the step definitions
- provide the template(s) logic

This is so that we can reuse these components for vastly different angular projects.

## Status

We use this in production - it works - give it a try!

## Installation

```shell
bower install angular-tourist --save
```

## Demo

In the source. TODO: setup demo page

## Usage

1. Add `angular.tourist` to your application module dependencies.

```javascript
angular.module('my.app', [
  'angular.tourist' // Add this
])
```

2. Add desired steps to your markup, giving each step a unique name.

Optionally you can add `tour-content`, `tour-data`, `tour-enter`, `tour-leave`,
`tour-completed`, and `tour-started` attributes. These are explained below.

```html
<html>
<body>
(...)
<h1 tour-step="heading">Heading</h1>

<nav>
<h6>{{ navTitle }}</h6>
<item tour-step="nav-home" tour-content="Go home here!">Home</item>
<item tour-step="nav-signup" tour-content="Sign up here!">Sign up</item>
</nav>
(...)
```

All of these attributes can be defined in the config and are optional:

- `tour-content` - Content of the tour (String - '')
- `tour-data` - Set a data object. This is made available to the template
                  when the step is avtive (Object - { my: 'custom', value: true })

* Callbacks

These are evaluated in the same scope as the tour-step directive.

- `tour-enter` - Angular expression to run when step is activated (Expression - 'doIt();count=1')
- `tour-leave` - As above, except when step is left
- `tour-completed` - Tour has completed
- `tour-started` - Tour has started


3. Define your template somewhere in the markup

Here is where things are a bit clunky. In your defined template you will need to
work with the scope provided. This is explained below.

```html
<script type="text/ng-template" id="some/template.html">
  <div ng-style="$pos" ng-if="$show" class="tour_-highlight">
    <p>My value is: {{ $data.value }}</p>
  </div>
</script>

<div tour-template="first" src="some/template.html" />
<div tour-template="second" src="some/other/template.html" />
```

`<div ng-style="$pos" ng-if="$show">`
`$pos` is a object with the target elements absolute position and width/height.
`show` is true if the tour is active, otherwise false

`<div tour-template="first" src="some/template.html" />`
`tour-template="name"` declare a template, optionally giving it a name.
                       Name is used in the config.
`src="..."` - template url in directive (can be a remote url)

`<p>My value is: {{ $data.value }}</p>` Step data

4. Setup your steps

```javascript
angular.module('my.app', ['angular.tourist'])

  .config(['touristProvider', function(tourist) {
    tourist.define({
      autostart: false, // Whether the tour starts as soon as the page loads
      stepDefaults: { // Defaults for all steps
        template: 'first',
        activeClass: 'cool-class',
        data: { /* etc */ }
      },
      steps: [ // Array of steps, currently you have to define a step here.
               // This array defines the tour order
        {
          for: 'heading', // This corresponds to the `tour-step` name given in your markup
          content: 'Provide content here, {{ $data.interpolated }}'
          data: // Values available in the template
            interpolated: 'Values are interpolated'
        },
        {
          for: 'nav-signup',
          enter: function($scope) { // First argument is the scope of the tour-step directive
            $scope.navTitle = "You are on signup";
          }
        },
        {
          for: 'nav-home',
          template: 'second',
          leave: function($scope) {
            // ...
          }
        }
      ]
    })
  }])
```

5. Start your engines

```
module.controller('MyCtrl', ['$scope', 'tourist', ($scope, tourist) ->
  // Only needed if you have autostart: false in the config
  $scope.startTour = function() {
    tourist.start(); // optional first arg is the index to start at.
   };

   $scope.endTour = function() {
      tourist.end()
   }
])
```

Please see the code for other properties in the `tourist` shared object.

### License

MIT: http://fixate.mit-license.org/
