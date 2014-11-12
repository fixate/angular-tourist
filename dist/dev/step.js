angular.module('angular.tourist').directive('tourStep', [
  '$tourist', '$window', '$injector', function($tourist, $window, $injector) {
    return {
      restrict: 'EAC',
      controller: [
        '$scope', function($scope) {
          var _boundingOffset, _isFixed;
          this.element = null;
          _isFixed = function(element) {
            while (element.parentNode.tagName !== 'HTML') {
              if ($window.getComputedStyle(element)['position'] === 'fixed') {
                return true;
              }
              element = element.parentNode;
            }
            return false;
          };
          _boundingOffset = function(element) {
            var box, doc, documentElem, documentOffset;
            if (element == null) {
              return;
            }
            doc = element.ownerDocument;
            documentElem = doc.documentElement;
            documentOffset = _isFixed(element) ? {
              x: 0,
              y: 0
            } : {
              x: $window.pageXOffset || documentElem.scrollLeft,
              y: $window.pageYOffset || documentElem.scrollTop
            };
            box = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : void 0;
            if (box == null) {
              return;
            }
            return {
              top: box.top + documentOffset.y - (documentElem.clientTop || 0),
              left: box.left + documentOffset.x - (documentElem.clientLeft || 0),
              width: element.offsetWidth,
              height: element.offsetHeight
            };
          };
          this.activate = (function(_this) {
            return function(step) {
              var offset, scroll;
              if (!_isFixed(_this.element[0])) {
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
              }
            };
          })(this);
          this.offset = (function(_this) {
            return function() {
              return _boundingOffset(_this.element[0]);
            };
          })(this);
          return this.positioning = (function(_this) {
            return function() {
              var pos;
              return pos = _isFixed(_this.element[0]) ? {
                position: 'fixed'
              } : {
                position: 'absolute'
              };
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
