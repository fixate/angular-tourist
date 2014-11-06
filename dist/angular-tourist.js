angular.module('angular.tourist', []);

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

var Tour,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Tour = (function() {
  Tour.PROPS = ['content', 'values'];

  Tour.EVT_PROPS = ['enter', 'leave', 'completed', 'started'];

  function Tour(options) {
    this.registerTemplate = __bind(this.registerTemplate, this);
    this.registerStep = __bind(this.registerStep, this);
    this.stepScope = __bind(this.stepScope, this);
    this.getStep = __bind(this.getStep, this);
    this.getElementStepData = __bind(this.getElementStepData, this);
    this.setSteps = __bind(this.setSteps, this);
    this.getElement = __bind(this.getElement, this);
    this.getTemplate = __bind(this.getTemplate, this);
    this.leave = __bind(this.leave, this);
    this.enter = __bind(this.enter, this);
    this.showStep = __bind(this.showStep, this);
    this.setActiveStep = __bind(this.setActiveStep, this);
    this.emit = __bind(this.emit, this);
    this.on = __bind(this.on, this);
    this.activate = __bind(this.activate, this);
    this.previous = __bind(this.previous, this);
    this.isLastStep = __bind(this.isLastStep, this);
    this.hasPrevious = __bind(this.hasPrevious, this);
    this.hasNext = __bind(this.hasNext, this);
    this.next = __bind(this.next, this);
    this.end = __bind(this.end, this);
    this.start = __bind(this.start, this);
    this.reset = __bind(this.reset, this);
    this.options = options;
    this.elements = {};
    this.templates = {};
    this.reset();
    if (options.enter != null) {
      this.on('enter', options.enter);
    }
    if (options.leave != null) {
      this.on('leave', options.leave);
    }
    this.on('enter', this.enter);
    this.on('leave', this.leave);
    if (this.options.autostart) {
      this.start();
    }
  }

  Tour.prototype.reset = function() {
    this.index = false;
    this.activeStep = null;
    return this.lastStep = null;
  };

  Tour.prototype.start = function(at) {
    if (at == null) {
      at = 0;
    }
    this.setSteps(this.options.steps);
    if (this.activeStep == null) {
      this.setActiveStep(at);
      this.activate();
      return this.emit('started');
    }
  };

  Tour.prototype.end = function() {
    if (this.activeStep != null) {
      this.emit('leave', this.activeStep);
      this.getTemplate().hide();
      this.emit('complete');
      return this.reset();
    }
  };

  Tour.prototype.next = function() {
    if (this.setActiveStep(this.index + 1)) {
      return this.activate();
    } else {
      return this.end();
    }
  };

  Tour.prototype.hasNext = function() {
    return this.index < this.steps.length - 1;
  };

  Tour.prototype.hasPrevious = function() {
    return this.index > 0;
  };

  Tour.prototype.isLastStep = function() {
    return this.index === this.steps.length - 1;
  };

  Tour.prototype.previous = function() {
    if (this.setActiveStep(this.index - 1)) {
      return this.activate();
    }
  };

  Tour.prototype.activate = function() {
    if (this.lastStep != null) {
      this.emit('leave', this.lastStep);
    }
    this.emit('enter', this.activeStep);
    return this.showStep();
  };

  Tour.prototype.on = function(event, handler) {
    return Tour.$rootScope.$on("$$tour-" + event, handler);
  };

  Tour.prototype.emit = function(event, step) {
    var fn;
    if (step == null) {
      step = null;
    }
    if (step && (fn = step[event])) {
      fn.apply(this, [this.stepScope(step)]);
    }
    return Tour.$rootScope.$emit("$$tour-" + event, this, step);
  };

  Tour.prototype.setActiveStep = function(index) {
    if (index >= this.steps.length) {
      return this.index = null;
    } else if (index >= 0) {
      if (this.index !== false) {
        this.lastStep = this.getStep(this.index);
      }
      this.index = index;
      this.activeStep = this.getStep(index);
      return true;
    }
  };

  Tour.prototype.showStep = function() {
    return this.getTemplate().show(this.getElement(), this.activeStep);
  };

  Tour.prototype.enter = function() {
    var el;
    el = this.getElement();
    if (this.activeStep.activeClass != null) {
      return el.addClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.leave = function() {
    var el;
    el = this.getElement();
    if (this.activeStep.activeClass != null) {
      return el.removeClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.getTemplate = function() {
    return this.templates[this.activeStep.template || 'default'];
  };

  Tour.prototype.getElement = function(step) {
    if (step == null) {
      step = this.activeStep;
    }
    return this.elements[step["for"]];
  };

  Tour.prototype.setSteps = function(steps) {
    var defaults, newStep, step, _i, _len;
    this.steps = [];
    defaults = this.options.stepDefault || {};
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      newStep = angular.extend({}, defaults || {}, step, this.getElementStepData(step));
      if (defaults.values != null) {
        newStep.values = angular.extend({}, defaults.values, step.values);
      }
      this.steps.push(newStep);
    }
  };

  Tour.prototype.getElementStepData = function(step) {
    var $parse, el, scope, stepData;
    el = this.getElement(step);
    scope = el.scope();
    stepData = {};
    $parse = Tour.$parse;
    angular.forEach(Tour.PROPS.concat(Tour.EVT_PROPS), (function(_this) {
      return function(prop) {
        var value;
        if (!(value = el.attr("tour-" + prop))) {
          return;
        }
        if (__indexOf.call(Tour.EVT_PROPS, prop) >= 0) {
          value = $parse(value);
        } else if (prop === 'values') {
          value = scope.$eval(value);
        }
        return stepData[prop] = value;
      };
    })(this));
    return stepData;
  };

  Tour.prototype.getStep = function() {
    return this.steps[this.index];
  };

  Tour.prototype.stepScope = function(step) {
    return angular.element(this.elements[step["for"]]).scope();
  };

  Tour.prototype.registerStep = function(name, element) {
    return this.elements[name] = element;
  };

  Tour.prototype.registerTemplate = function(name, ctrl) {
    return this.templates[name || 'default'] = ctrl;
  };

  return Tour;

})();

angular.module('angular.tourist').provider('tourist', function() {
  var _tourOptions;
  _tourOptions = null;
  this.define = (function(_this) {
    return function(options) {
      _tourOptions = options;
    };
  })(this);
  this.$get = [
    '$injector', '$rootScope', '$parse', function($injector, $rootScope, $parse) {
      Tour.$rootScope = $rootScope;
      Tour.$injector = $injector;
      Tour.$parse = $parse;
      return new Tour(_tourOptions);
    }
  ];
});
