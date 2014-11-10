var Tour,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Tour = (function() {
  Tour.PROPS = ['content', 'data'];

  Tour.EVT_PROPS = ['enter', 'leave', 'completed', 'started'];

  function Tour(name, options) {
    this.name = name;
    this.stepScope = __bind(this.stepScope, this);
    this.getStep = __bind(this.getStep, this);
    this.getControllerStepData = __bind(this.getControllerStepData, this);
    this.setSteps = __bind(this.setSteps, this);
    this.getController = __bind(this.getController, this);
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
    var _this;
    _this = this;
    return Tour.$rootScope.$on("$$tour-" + this.name + "-" + event, function(_, $scope, $step) {
      return Tour.$injector.invoke(handler, _this, {
        $scope: $scope,
        $step: $step
      });
    });
  };

  Tour.prototype.emit = function(event, step) {
    var $scope, fn;
    if (step == null) {
      step = null;
    }
    $scope = null;
    if (step) {
      $scope = this.stepScope(step);
      if (fn = step[event]) {
        if (fn.$$tourParsed != null) {
          fn($scope);
        } else {
          Tour.$injector.invoke(fn, this, {
            $scope: $scope,
            $step: step
          });
        }
      }
    }
    return Tour.$rootScope.$emit("$$tour-" + this.name + "-" + event, $scope, step);
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
    var ctrl, template;
    template = this.getTemplate();
    template.setTour(this);
    ctrl = this.getController();
    template.show(ctrl, this.activeStep);
    return ctrl.activate(this.activeStep);
  };

  Tour.prototype.enter = function() {
    var el;
    el = this.getController().element;
    if (this.activeStep.activeClass != null) {
      return el.addClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.leave = function() {
    var el;
    el = this.getController().element;
    if (this.activeStep.activeClass != null) {
      return el.removeClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.getTemplate = function() {
    return Tour.templates[this.activeStep.template || 'default'];
  };

  Tour.prototype.getController = function(step) {
    if (step == null) {
      step = this.activeStep;
    }
    return Tour.controllers[step["for"]];
  };

  Tour.prototype.setSteps = function(steps) {
    var defaults, newStep, step, _i, _len;
    this.steps = [];
    defaults = this.options.stepDefault || {};
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      newStep = angular.extend({}, defaults || {}, step, this.getControllerStepData(step));
      if (defaults.data != null) {
        newStep.data = angular.extend({}, defaults.data, step.data);
      }
      this.steps.push(newStep);
    }
  };

  Tour.prototype.getControllerStepData = function(step) {
    var $parse, ctrl, el, scope, stepData;
    ctrl = this.getController(step);
    if (ctrl == null) {
      return {};
    }
    el = ctrl.element;
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
          value.$$tourParsed = true;
        } else if (prop === 'data') {
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
    return angular.element(this.getController(step).element).scope();
  };

  return Tour;

})();

angular.module('angular.tourist').provider('$tourist', function() {
  var _stepCtrls, _templates, _tourOpts;
  _tourOpts = {};
  _stepCtrls = {};
  _templates = {};
  this.define = function(name, options) {
    if (typeof name === 'object') {
      options = name;
      name = 'default';
    }
    _tourOpts[name] = options;
  };
  this.$get = [
    '$rootScope', '$parse', '$injector', function($rootScope, $parse, $injector) {
      var _tours;
      _tours = {};
      Tour.$rootScope = $rootScope;
      Tour.$parse = $parse;
      Tour.$injector = $injector;
      Tour.controllers = _stepCtrls;
      Tour.templates = _templates;
      return {
        get: function(name) {
          if (name == null) {
            name = 'default';
          }
          if (_tourOpts[name] == null) {
            throw "You have not defined a tour configuration for " + name + "!";
          }
          if (_templates.length === 0) {
            throw "You have not defined any templates for the tour!";
          }
          if (_stepCtrls.length === 0) {
            throw "You have not defined any steps for the tour!";
          }
          return _tours[name] || (_tours[name] = new Tour(name, _tourOpts[name]));
        },
        registerStep: function(name, ctrl) {
          return _stepCtrls[name] = ctrl;
        },
        registerTemplate: function(name, ctrl) {
          if (typeof name === 'object') {
            ctrl = name;
            name = 'default';
          }
          return _templates[name || 'default'] = ctrl;
        }
      };
    }
  ];
});
