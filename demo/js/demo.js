angular.module('angular.tourist.demo', ['angular.tourist']).config([
  'touristProvider', function($tour) {
    return $tour.define({
      autostart: false,
      stepDefault: {
        activeClass: 'highlight',
        data: {
          position: "top left"
        }
      },
      enter: function($event, tour, step) {
        return console.log("[enter] step " + step["for"]);
      },
      leave: function($event, tour, step) {
        return console.log("[leave] step " + step["for"]);
      },
      steps: [
        {
          "for": 'navigation',
          content: 'This is the {{ $data.name }}!',
          enter: function($scope) {
            return $scope.navBorder = true;
          },
          leave: function($scope) {
            return $scope.navBorder = false;
          },
          data: {
            name: 'Sidenav',
            title: 'Step 1'
          }
        }, {
          "for": 'exitNav',
          content: 'Exit the site?!',
          data: {
            position: "bottom left"
          }
        }, {
          "for": 'image',
          content: 'This image is random',
          data: {
            position: "center right"
          }
        }, {
          "for": 'paragraph'
        }
      ]
    });
  }
]).controller('DemoCtrl', [
  '$scope', 'tourist', function($scope, tourist) {
    $scope.startTour = function() {
      return tourist.start();
    };
    $scope.endTour = function() {
      return tourist.end();
    };
    tourist.on('started', function() {
      return $scope.tourStarted = true;
    });
    return tourist.on('complete', function() {
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
        positionMy: '='
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
            position: scope.position,
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
