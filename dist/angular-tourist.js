angular.module('angular.tourist', []);

angular.module('angular.tourist').directive('tourStep', [
  '$tourist', '$window', '$injector', function($tourist, $window, $injector) {
    return {
      restrict: 'EAC',
      controller: [
        '$scope', function($scope) {
          var _boundingOffset, _isFixed, _stepIsFixed;
          this.element = null;
          _stepIsFixed = null;
          _isFixed = function(element) {
            if (_stepIsFixed == null) {
              while (element.parentNode.tagName !== 'HTML') {
                if ($window.getComputedStyle(element)['position'] === 'fixed') {
                  _stepIsFixed = true;
                  break;
                } else {
                  _stepIsFixed = false;
                  element = element.parentNode;
                }
              }
            }
            return _stepIsFixed;
          };
          _boundingOffset = function(element) {
            var box, doc, documentElem, documentOffset;
            if (element == null) {
              return;
            }
            doc = element.ownerDocument;
            documentElem = doc.documentElement;
            box = typeof element.getBoundingClientRect === "function" ? element.getBoundingClientRect() : void 0;
            if (_isFixed(element)) {
              documentOffset = {
                x: 0,
                y: 0
              };
            } else {
              documentOffset = {
                x: $window.pageXOffset || documentElem.scrollLeft,
                y: $window.pageYOffset || documentElem.scrollTop
              };
            }
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

angular.module('angular.tourist').directive('tourTemplate', [
  '$tourist', '$templateCache', '$interpolate', function($tourist, $templateCache, $interpolate) {
    $templateCache.put('angular/tourist.html', '<div ng-class="styles" ng-if="$show" ng-class="class">No template</div>');
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
        '$scope', function($scope) {
          this.show = function(ctrl, step) {
            $scope.$show = true;
            $scope.$pos = angular.extend(ctrl.offset(), ctrl.positioning());
            $scope.$data = step.data;
            return $scope.$content = $interpolate(step.content)($scope);
          };
          this.hide = function() {
            return $scope.$show = false;
          };
          this.set = function(vars) {
            return angular.forEach(vars, function(v, k) {
              return $scope[k] = v;
            });
          };
          this.setTour = function($tour) {
            $scope.$next = function() {
              return $tour.next();
            };
            $scope.$previous = function() {
              return $tour.previous();
            };
            $scope.$hasNext = function() {
              return $tour.hasNext();
            };
            $scope.$hasPrevious = function() {
              return $tour.hasPrevious();
            };
            $scope.$end = function() {
              return $tour.end();
            };
            return $scope.$isLastStep = function() {
              return $tour.isLastStep();
            };
          };
        }
      ],
      link: function(scope, element, attrs, ctrl) {
        $tourist.registerTemplate(scope.templateName, ctrl);
      }
    };
  }
]);

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
    var promise, template, _continue;
    promise = null;
    template = this.getTemplate();
    template.set({
      $transitioning: true
    });
    if (this.lastStep != null) {
      promise = this.emit('leave', this.lastStep);
    }
    _continue = (function(_this) {
      return function() {
        return _this.emit('enter', _this.activeStep).then(function() {
          _this.showStep(template);
          return template.set({
            $transitioning: false
          });
        });
      };
    })(this);
    if (promise != null) {
      return promise.then(_continue);
    } else {
      return _continue();
    }
  };

  Tour.prototype.on = function(event, handler) {
    var _this;
    _this = this;
    return Tour.$rootScope.$on("$$tour-" + this.name + "-" + event, function($event, $scope, $step) {
      return Tour.$injector.invoke(handler, _this, {
        $scope: $scope,
        $step: $step,
        $event: $event
      });
    });
  };

  Tour.prototype.emit = function(event, step) {
    var $scope, fn, fns, promises, q, ret, rets, _i, _j, _len, _len1;
    if (step == null) {
      step = null;
    }
    $scope = null;
    rets = [];
    if (step) {
      $scope = this.stepScope(step);
      if (fns = step[event]) {
        for (_i = 0, _len = fns.length; _i < _len; _i++) {
          fn = fns[_i];
          ret = fn.$$tourParsed != null ? fn($scope) : Tour.$injector.invoke(fn, this, {
            $scope: $scope,
            $step: step,
            $element: this.getController(step).element
          });
          rets.push(ret);
        }
      }
    }
    Tour.$rootScope.$emit("$$tour-" + this.name + "-" + event, $scope, step);
    promises = [];
    for (_j = 0, _len1 = rets.length; _j < _len1; _j++) {
      ret = rets[_j];
      if ((ret != null) && (ret.then != null)) {
        promises.push(ret);
      } else {
        q = Tour.$q.defer();
        q.resolve(ret);
        promises.push(q.promise);
      }
    }
    return Tour.$q.all(promises);
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

  Tour.prototype.showStep = function(template) {
    var ctrl;
    ctrl = this.getController();
    template.show(ctrl, this.activeStep);
    return ctrl.activate(this.activeStep);
  };

  Tour.prototype.enter = function() {
    var el;
    el = this.getController().element;
    if (this.activeStep.activeClass != null) {
      el.addClass(this.activeStep.activeClass);
    }
    if (el.css('position') === 'static') {
      return el.css('position', 'relative');
    }
  };

  Tour.prototype.leave = function() {
    var el;
    el = this.getController(this.lastStep).element;
    if (this.activeStep.activeClass != null) {
      el.removeClass(this.activeStep.activeClass);
    }
    return el.css({
      'position': ''
    });
  };

  Tour.prototype.getTemplate = function() {
    var template, templateKey;
    templateKey = this.activeStep.template;
    if (typeof templateKey === 'function') {
      templateKey = templateKey(this);
    }
    template = Tour.templates[templateKey || 'default'];
    template.setTour(this);
    return template;
  };

  Tour.prototype.getController = function(step) {
    if (step == null) {
      step = this.activeStep;
    }
    return Tour.controllers[step["for"]];
  };

  Tour.prototype.setSteps = function(steps) {
    var defaults, elemData, newStep, step, _i, _len;
    this.steps = [];
    defaults = this.options.stepDefault || {};
    for (_i = 0, _len = steps.length; _i < _len; _i++) {
      step = steps[_i];
      elemData = this.getControllerStepData(step);
      newStep = angular.extend({}, defaults, step);
      angular.forEach(Tour.EVT_PROPS, function(evt) {
        var fn;
        fn = newStep[evt];
        newStep[evt] = [];
        if (fn != null) {
          newStep[evt].push(fn);
        }
        if (elemData[evt] != null) {
          newStep[evt].push(elemData[evt]);
        }
        return delete elemData[evt];
      });
      angular.extend(newStep, elemData);
      if (defaults.data != null) {
        newStep.data = angular.extend({}, defaults.data, step.data, elemData.data);
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

  Tour.prototype.getStep = function(index) {
    if (index == null) {
      index = this.index;
    }
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
    '$rootScope', '$parse', '$injector', '$q', function($rootScope, $parse, $injector, $q) {
      var _tours;
      _tours = {};
      Tour.$rootScope = $rootScope;
      Tour.$parse = $parse;
      Tour.$injector = $injector;
      Tour.controllers = _stepCtrls;
      Tour.templates = _templates;
      Tour.$q = $q;
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
