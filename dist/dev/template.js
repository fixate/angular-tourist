angular.module('angular.tourist').directive('tourTemplate', [
  'tourist', '$window', '$templateCache', '$interpolate', function(tourist, $window, $templateCache, $interpolate) {
    $templateCache.put('angular/tourist.html', '<div ng-class="styles" ng-if="$show" ng-class="class"> </div>');
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
        '$scope', 'tourist', function($scope, tourist) {
          var _boundingOffset;
          _boundingOffset = function(element) {
            var box, doc, documentElem;
            if (element == null) {
              return;
            }
            doc = element.ownerDocument;
            documentElem = doc.documentElement;
            box = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : void 0;
            if (box == null) {
              return;
            }
            return {
              top: box.top + ($window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
              left: box.left + ($window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0),
              width: element.offsetWidth,
              height: element.offsetHeight
            };
          };
          this.show = function(element, step) {
            $scope.$show = true;
            $scope.$pos = angular.extend(_boundingOffset(element[0]), {
              position: 'absolute'
            });
            $scope.$data = step.data;
            return $scope.$content = $interpolate(step.content)($scope);
          };
          return this.hide = (function(_this) {
            return function() {
              return $scope.$show = false;
            };
          })(this);
        }
      ],
      link: function(scope, element, attrs, ctrl) {
        tourist.registerTemplate(scope.templateName, ctrl);
        return scope.tourist = tourist;
      }
    };
  }
]);
