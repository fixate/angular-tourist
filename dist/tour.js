var Tour,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Tour = (function() {
  function Tour(options) {
    this.registerTemplate = __bind(this.registerTemplate, this);
    this.registerStep = __bind(this.registerStep, this);
    this.stepScope = __bind(this.stepScope, this);
    this.getStep = __bind(this.getStep, this);
    this.setSteps = __bind(this.setSteps, this);
    this.getElement = __bind(this.getElement, this);
    this.getTemplate = __bind(this.getTemplate, this);
    this.teardown = __bind(this.teardown, this);
    this.setup = __bind(this.setup, this);
    this.showStep = __bind(this.showStep, this);
    this.setActiveStep = __bind(this.setActiveStep, this);
    this.emit = __bind(this.emit, this);
    this.on = __bind(this.on, this);
    this.activate = __bind(this.activate, this);
    this.previous = __bind(this.previous, this);
    this.next = __bind(this.next, this);
    this.end = __bind(this.end, this);
    this.start = __bind(this.start, this);
    this.reset = __bind(this.reset, this);
    this.options = options;
    this.setSteps(options.steps);
    this.elements = {};
    this.templates = {};
    this.reset();
    if (options.setup != null) {
      this.on('setup', options.setup);
    }
    if (options.teardown != null) {
      this.on('teardown', options.teardown);
    }
    this.on('setup', this.setup);
    this.on('teardown', this.teardown);
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
    if (this.activeStep == null) {
      this.setActiveStep(at);
      this.activate();
      return this.emit('started');
    }
  };

  Tour.prototype.end = function() {
    if (this.activeStep != null) {
      this.emit('teardown', this.activeStep);
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

  Tour.prototype.previous = function() {
    if (this.setActiveStep(this.index - 1)) {
      return this.activate();
    }
  };

  Tour.prototype.activate = function() {
    if (this.lastStep != null) {
      this.emit('teardown', this.lastStep);
    }
    this.emit('setup', this.activeStep);
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
    return Tour.$rootScope.$emit("$$tour-" + event, this);
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

  Tour.prototype.setup = function() {
    var el;
    el = this.getElement();
    if (this.activeStep.activeClass != null) {
      return el.addClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.teardown = function() {
    var el;
    el = this.getElement();
    if (this.activeStep.activeClass != null) {
      return el.removeClass(this.activeStep.activeClass);
    }
  };

  Tour.prototype.getTemplate = function() {
    return this.templates[this.activeStep.template || 'default'];
  };

  Tour.prototype.getElement = function() {
    return this.elements[this.activeStep["for"]];
  };

  Tour.prototype.setSteps = function(steps) {
    var step, _i, _len;
    this.steps = [];
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      this.steps.push(angular.extend({}, this.options.stepDefault || {}, step));
    }
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
    '$injector', '$rootScope', function($injector, $rootScope) {
      Tour.$rootScope = $rootScope;
      Tour.$injector = $injector;
      return new Tour(_tourOptions);
    }
  ];
});
