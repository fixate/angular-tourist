angular.module('angular.tourist.demo', ['angular.tourist']).config([
  'touristProvider', function($tour) {
    return $tour.define({
      stepDefault: {
        activeClass: 'highlight',
        position: 'south'
      },
      steps: [
        {
          "for": 'navigation',
          content: 'This is the {{ name }}!',
          setup: function($scope) {
            $scope.extraNavItem = true;
            return console.log('step 1 setup', this.activeStep);
          },
          teardown: function($scope) {
            $scope.extraNavItem = false;
            return console.log('step 1 teardown', this.activeStep);
          },
          values: {
            name: 'Sidenav',
            position: 'north',
            title: 'This has a title!'
          }
        }, {
          "for": 'exitNav',
          content: 'Exit the site?!',
          setup: function($scope) {
            return console.log('step 2 setup', this.activeStep);
          },
          teardown: function($scope) {
            return console.log('step 2 teardown', this.activeStep);
          }
        }, {
          "for": 'image',
          content: 'This image is random',
          setup: function($scope) {
            return console.log('step 2 setup', this.activeStep);
          },
          teardown: function($scope) {
            return console.log('step 2 teardown', this.activeStep);
          }
        }, {
          "for": 'paragraph',
          content: 'paragraph',
          setup: function($scope) {
            return console.log('step 2 setup', this.activeStep);
          },
          teardown: function($scope) {
            return console.log('step 2 teardown', this.activeStep);
          }
        }
      ],
      autostart: false
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
      scope: {
        content: '@',
        onRender: '&'
      },
      link: function(scope, element, attrs) {
        var compiler, el, options;
        options = scope.$eval(attrs.uiTooltip) || {};
        $ = angular.element;
        el = $("<span>" + scope.content + "</span>");
        compiler = $compile(el);
        $.extend(true, options, {
          content: {
            text: el
          },
          style: {
            tip: {
              width: 16,
              height: 8
            }
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
        element.qtip(options);
        return compiler(scope.$parent);
      }
    };
  }
]);
