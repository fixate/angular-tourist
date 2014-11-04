angular.module 'angular.tourist'

  .directive 'tourStep', ['tourist', (tourist) ->
    restrict: 'EAC'
    link: (scope, element, attrs) ->
      tourist.registerStep(attrs.tourStep, scope)
  ]
