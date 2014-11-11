angular.module('angular.tourist').directive('tourStep', [
  '$tourist', '$window', '$injector', function($tourist, $window, $injector) {
    return {
      restrict: 'EAC',
      controller: [
        '$scope', function($scope) {
          var _boundingOffset;
          this.element = null;
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
          this.activate = (function(_this) {
            return function(step) {
              var offset, scroll;
              offset = _this.offset();
              scroll = {
                left: offset.left + offset.width / 2 - $window.innerWidth / 2,
                top: offset.top + offset.height / 2 - $window.innerHeight / 2
              };
              step.activated || (step.activated = [
                'scroll', function(scroll) {
                  return $window.scrollTo(scroll.left, scroll.top);
                }
              ]);
              return $injector.invoke(step.activated, _this, {
                scroll: scroll
              });
            };
          })(this);
          return this.offset = (function(_this) {
            return function() {
              return _boundingOffset(_this.element[0]);
            };
          })(this);
        }
      ],
      link: function(scope, element, attrs, ctrl) {
        ctrl.element = element;
        return $tourist.registerStep(attrs.tourStep, ctrl);
      }
    };
  }
]);
