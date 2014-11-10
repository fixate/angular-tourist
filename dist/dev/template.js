angular.module('angular.tourist').directive('tourTemplate', [
  '$tourist', '$templateCache', '$interpolate', function($tourist, $templateCache, $interpolate) {
    $templateCache.put('angular/tourist.html', '<div ng-class="styles" ng-if="$show" ng-class="class">No template</div>');
    return {
      restrict: 'EA',
      templateUrl: function(element, attrs) {
        return attrs.src || 'angular/tourist.html';
      },
      scope: {
        templateName: '@tourTemplate',
        "class": '@activeClass'
      },
      controller: [
        '$scope', function($scope) {
          this.show = function(ctrl, step) {
            $scope.$show = true;
            $scope.$pos = angular.extend(ctrl.offset(), {
              position: 'absolute'
            });
            $scope.$data = step.data;
            return $scope.$content = $interpolate(step.content)($scope);
          };
          this.hide = function() {
            return $scope.$show = false;
          };
          this.setTour = function($tour) {
            $scope.$next = function() {
              return $tour.next();
            };
            $scope.$previous = function() {
              return $tour.previous();
            };
            $scope.$hasNext = function() {
              return $tour.hasNext();
            };
            $scope.$hasPrevious = function() {
              return $tour.hasPrevious();
            };
            $scope.$end = function() {
              return $tour.end();
            };
            return $scope.$isLastStep = function() {
              return $tour.isLastStep();
            };
          };
        }
      ],
      link: function(scope, element, attrs, ctrl) {
        $tourist.registerTemplate(scope.templateName, ctrl);
      }
    };
  }
]);
