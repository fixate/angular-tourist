var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

angular.module('angular.tourist').constant('Tour', function() {
  var Tour;
  return Tour = (function() {
    Tour.PROPERTIES = ['for', 'content', 'before', 'after'];

    function Tour(steps, defaults) {
      this.steps = steps;
      this.defaults = defaults;
      this.extendStep = __bind(this.extendStep, this);
      this.activeStep = __bind(this.activeStep, this);
      this.process = __bind(this.process, this);
      this.start = __bind(this.start, this);
      this.index = false;
      this.scopes = {};
      this.lastStep = null;
    }

    Tour.prototype.start = function(at) {
      if (at == null) {
        at = 0;
      }
      if (this.index !== false) {
        return;
      }
      this.index = at;
      return this.process();
    };

    Tour.prototype.process = function() {
      this.beforeCallbacks();
      return this.applyTemplate();
    };

    Tour.prototype.activeStep = function() {
      if (this.index === false) {
        return null;
      }
      return this.extendStep(this.steps[this.index]);
    };

    Tour.prototype.extendStep = function(step) {
      return angular.extend(true, this.options.stepDefault, step);
    };

    return Tour;

  })();
}).provider('tourist', [
  'Tour', function(Tour) {
    var _tour;
    _tour = null;
    this.define = (function(_this) {
      return function(options) {
        _tour = new Tour(options.steps, options.stepDefault);
        if (options.autostart) {
          _tour.start();
        }
      };
    })(this);
    this.$get = function() {
      return {
        tour: function() {
          return _tour;
        },
        start: function() {
          return _tour.start();
        },
        registerStep: function(name, scope) {
          return _tour.scopes[name] = scope;
        }
      };
    };
  }
]);
