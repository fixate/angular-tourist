angular.module 'angular.tourist'

  .directive 'tourTemplate', [
    '$tourist', '$templateCache', '$interpolate',
    ($tourist, $templateCache, $interpolate) ->

      $templateCache.put 'angular/tourist.html',
        '<div ng-class="styles" ng-if="$show" ng-class="class">No template</div>'

      restrict: 'EA'
      templateUrl: (element, attrs) -> attrs.src || 'angular/tourist.html'
      scope:
        templateName: '@tourTemplate'
        class: '@activeClass'
      controller: ['$scope', ($scope) ->
        @show = (ctrl, step) ->
          $scope.$show = true
          $scope.$pos = angular.extend(ctrl.offset(), ctrl.positioning())
          $scope.$data = step.data
          $scope.$content = $interpolate(step.content)($scope)

        @hide = () ->
          $scope.$show = false

        @set = (vars) ->
          angular.forEach vars, (v, k) ->
            $scope[k] = v

        @setTour = ($tour) ->
          $scope.$next = () -> $tour.next()
          $scope.$previous = () -> $tour.previous()
          $scope.$hasNext = () -> $tour.hasNext()
          $scope.$hasPrevious = () -> $tour.hasPrevious()
          $scope.$end = () -> $tour.end()
          $scope.$isLastStep = () -> $tour.isLastStep()

        return
      ]
      link: (scope, element, attrs, ctrl) ->
        $tourist.registerTemplate(scope.templateName, ctrl)
        return
    ]


