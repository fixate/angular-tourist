angular.module('angular.tourist.demo', ['angular.tourist']).config([
  '$touristProvider', function($tour) {
    return $tour.define('main', {
      autostart: false,
      stepDefault: {
        activeClass: 'highlight',
        zIndex: 2000,
        data: {
          positionMy: "top left",
          positionAt: "left center"
        }
      },
      enter: [
        '$step', function($step) {
          return console.log("[enter] step " + $step["for"]);
        }
      ],
      leave: [
        '$step', function($step) {
          return console.log("[leave] step " + $step["for"]);
        }
      ],
      steps: [
        {
          "for": 'navigation',
          content: 'This is the {{ $data.name }}!',
          enter: [
            '$scope', function($scope) {
              return $scope.navBorder = true;
            }
          ],
          leave: [
            '$scope', function($scope) {
              return $scope.navBorder = false;
            }
          ],
          data: {
            name: 'Sidenav',
            title: 'Step 1',
            positionAt: "right center"
          }
        }, {
          "for": 'exitNav',
          content: 'Exit the site?!'
        }, {
          "for": 'image',
          content: 'This image is random',
          data: {
            positionMy: "center right",
            positionAt: "right center"
          }
        }, {
          "for": 'paragraph',
          data: {
            positionAt: "bottom center"
          },
          enter: [
            '$animate', '$element', function($animate, $element) {
              return $animate.addClass($element, 'animate-paragraph').then(function() {
                return console.log('finished');
              });
            }
          ],
          leave: [
            '$animate', '$element', function($animate, $element) {
              return $animate.removeClass($element, 'animate-paragraph');
            }
          ]
        }, {
          "for": 'another-image',
          content: 'Another image which we have to auto scroll to.',
          data: {
            positionMy: 'left center',
            positionAt: "right center"
          }
        }
      ]
    });
  }
]).controller('DemoCtrl', [
  '$scope', '$tourist', '$timeout', function($scope, $tourist, $timeout) {
    var tour;
    tour = $tourist.get('main');
    $scope.startTour = function() {
      return tour.start();
    };
    $scope.endTour = function() {
      return tour.end();
    };
    tour.on('started', function() {
      return $scope.tourStarted = true;
    });
    return tour.on('complete', function() {
      return $scope.tourStarted = false;
    });
  }
]).directive('uiTooltip', [
  '$compile', function($compile) {
    var $;
    $ = angular.element;
    if ($.fn.qtip == null) {
      if (typeof console.error === "function") {
        console.error('QTip not included! Unable to use tooltip directive.');
      }
    }
    return {
      restrict: 'AEC',
      transclude: true,
      scope: {
        content: '@',
        onRender: '&',
        reposition: '=',
        positionMy: '=',
        positionAt: '='
      },
      link: function(scope, element, attrs, ctrl, $transclude) {
        var api, compiler, el, options, qtip;
        options = scope.$eval(attrs.uiTooltip) || {};
        $ = angular.element;
        qtip = function(content) {
          angular.extend(options, {
            prerender: true,
            content: {
              text: content
            },
            hide: {
              event: false
            },
            show: {
              event: 'click'
            },
            events: {
              render: function(event, api) {
                scope.onRender({
                  event: event,
                  api: api
                });
              }
            }
          });
          return element.qtip(options).qtip('show');
        };
        if (scope.content) {
          el = $("<span>" + scope.content + "</span>");
          compiler = $compile(el);
          compiler(scope.$parent);
          qtip(el);
        } else {
          $transclude(function(clone) {
            el = $("<span></span>");
            el.append(clone);
            qtip(el);
          });
        }
        api = element.qtip('api');
        scope.$watch('content', function(content) {
          return api.set('content.text', content);
        });
        scope.$watch('positionMy', function(position) {
          if (position == null) {
            return;
          }
          return api.set('position.my', position);
        });
        scope.$watch('positionAt', function(position) {
          if (position == null) {
            return;
          }
          return api.set('position.at', position);
        });
        scope.$watch('reposition', function() {
          return api.reposition();
        });
        scope.$on('$destroy', function() {
          return api.hide();
        });
      }
    };
  }
]);
