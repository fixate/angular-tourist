angular.module 'angular.tourist'

  .directive 'tourTemplate', [
    'tourist', '$window', '$templateCache', '$interpolate',
    (tourist, $window, $templateCache, $interpolate) ->

      $templateCache.put 'angular/tourist.html', '
      <div ng-class="styles" ng-if="show" ng-class="class">

      </div>'

      restrict: 'EA'
      templateUrl: (element, attrs) -> attrs.src || 'angular/tourist.html'
      scope:
        templateName: '@tourTemplate'
        class: '@activeClass'
      controller: ['$scope', 'tourist', ($scope, tourist) ->
        # JQLite doesnt support offset, so we implement it here
        _boundingOffset = (element) ->
          return unless element?
          doc = element.ownerDocument
          documentElem = doc.documentElement
          box = element.getBoundingClientRect?()

          return unless box?

          {
            top: box.top + ($window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
            left: box.left + ($window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0),
            width: element.offsetWidth,
            height: element.offsetHeight
          }

        @show = (element, step) ->
          $scope.show = true
          $scope.styles = angular.extend(_boundingOffset(element[0]), {position: 'absolute'})
          $scope.values = step.values
          $scope.content = $interpolate(step.content)($scope)

        @hide = () =>
          $scope.show = false
      ]
      link: (scope, element, attrs, ctrl) ->
        tourist.registerTemplate(scope.templateName, ctrl)
        scope.tourist = tourist
    ]

