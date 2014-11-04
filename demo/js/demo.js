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
          before: [
            '$scope', function($scope) {
              return $scope.name = "Blah!";
            }
          ],
          position: 'north',
          title: 'This has a title!'
        }, {
          "for": 'exitNav',
          content: 'Exit the site?!'
        }, {
          "for": 'image',
          content: 'This image is random'
        }, {
          "for": 'paragraph',
          content: 'paragraph'
        }
      ],
      autostart: false
    });
  }
]).controller('DemoCtrl', [
  '$scope', 'tourist', function($scope, tourist) {
    return $scope.startTour = function() {
      return tourist.start();
    };
  }
]);
