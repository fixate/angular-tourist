angular.module('angular.tourist').directive('tourStep', [
  'tourist', function(tourist) {
    return {
      restrict: 'EAC',
      link: function(scope, element, attrs) {
        return tourist.registerStep(attrs.tourStep, element);
      }
    };
  }
]);
