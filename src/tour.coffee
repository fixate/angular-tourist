class Tour
  @PROPS = ['content', 'data']
  @EVT_PROPS = ['enter', 'leave', 'completed', 'started']

  constructor: (@name, options) ->
    @options = options
    @reset()
    @on('enter', options.enter) if options.enter?
    @on('leave', options.leave) if options.leave?
    @on('enter', @enter)
    @on('leave', @leave)

    if @options.autostart
      @start()

  reset: () =>
    @index = false
    @activeStep = null
    @lastStep = null

  start: (at = 0) =>
    @setSteps(@options.steps)
    unless @activeStep?
      @setActiveStep(at)
      @activate()
      @emit('started')

  end: =>
    if @activeStep?
      @emit('leave', @activeStep)
      @getTemplate().hide()
      @emit('complete')
      @reset()

  next: =>
    if @setActiveStep(@index + 1)
      @activate()
    else
      @end()

  hasNext: =>
    @index < @steps.length - 1

  hasPrevious: =>
    @index > 0

  isLastStep: =>
    @index == @steps.length - 1

  previous: =>
    if @setActiveStep(@index - 1)
      @activate()

  activate: () =>
    @emit('leave', @lastStep) if @lastStep?
    @emit('enter', @activeStep)
    @showStep()

  on: (event, handler) =>
    _this = @
    Tour.$rootScope.$on "$$tour-#{@name}-#{event}", (_, $scope, $step) ->
      Tour.$injector.invoke(handler, _this, $scope: $scope, $step: $step)

  emit: (event, step = null) =>
    $scope = null
    if step
      $scope = @stepScope(step)
      if fn = step[event]
        # HACK: This to detect an inline function which cannot be invoked
        # with the injector
        if fn.$$tourParsed?
          fn($scope)
        else
          Tour.$injector.invoke(fn, @, $scope: $scope, $step: step)
    Tour.$rootScope.$emit("$$tour-#{@name}-#{event}", $scope, step)

  setActiveStep: (index) =>
    if index >= @steps.length
      @index = null
    else if index >= 0
      @lastStep = @getStep(@index) unless @index == false
      @index = index
      @activeStep = @getStep(index)
      true

  showStep: () =>
    template = @getTemplate()
    template.setTour(@)
    ctrl = @getController()
    template.show(ctrl, @activeStep)
    ctrl.activate(@activeStep)

  enter: () =>
    el = @getController().element
    if @activeStep.activeClass?
      el.addClass(@activeStep.activeClass)

    if el.css('position') == 'static'
      el.css('position', 'relative')

    el.css('z-index', @activeStep.zIndex + 1 || 1001 )

  leave: () =>
    el = @getController(@lastStep).element
    if @activeStep.activeClass?
      el.removeClass(@activeStep.activeClass)

    el.css({'z-index': '', 'position': ''})

  getTemplate: () =>
    Tour.templates[@activeStep.template || 'default']

  getController: (step = @activeStep) =>
    Tour.controllers[step.for]

  setSteps: (steps) =>
    @steps = []
    defaults = @options.stepDefault || {}
    for step in steps
      newStep = angular.extend({}, defaults || {}, step, @getControllerStepData(step))
      if defaults.data?
        newStep.data = angular.extend({}, defaults.data, step.data)
      @steps.push(newStep)
    return

  getControllerStepData: (step) =>
    ctrl = @getController(step)
    return {} unless ctrl?
    el = ctrl.element
    scope = el.scope()
    stepData = {}
    $parse = Tour.$parse
    angular.forEach Tour.PROPS.concat(Tour.EVT_PROPS), (prop) =>
      return unless value = el.attr("tour-#{prop}")
      if prop in Tour.EVT_PROPS
        value = $parse(value)
        value.$$tourParsed = true
      else if prop == 'data'
        value = scope.$eval(value)

      stepData[prop] = value

    stepData

  getStep: (index = @index) =>
    @steps[@index]

  stepScope: (step) =>
    angular.element(@getController(step).element).scope()

angular.module 'angular.tourist'

  .provider '$tourist', ->
    _tourOpts = {}
    _stepCtrls = {}
    _templates = {}

    @define = (name, options) ->
      if typeof name == 'object'
        options = name
        name = 'default'

      _tourOpts[name] = options
      return

    @.$get = ['$rootScope', '$parse', '$injector', ($rootScope, $parse, $injector) ->
      _tours = {}

      # Tour dependencies
      Tour.$rootScope = $rootScope
      Tour.$parse = $parse
      Tour.$injector = $injector
      Tour.controllers = _stepCtrls
      Tour.templates = _templates

      {
        get: (name = 'default') ->
          throw "You have not defined a tour configuration for #{name}!" unless _tourOpts[name]?
          throw "You have not defined any templates for the tour!" if _templates.length == 0
          throw "You have not defined any steps for the tour!" if _stepCtrls.length == 0
          _tours[name] ||= new Tour(name, _tourOpts[name])

        registerStep: (name, ctrl) ->
          _stepCtrls[name] = ctrl

        registerTemplate: (name, ctrl) ->
          if typeof name == 'object'
            ctrl = name
            name = 'default'
          _templates[name || 'default'] = ctrl
      }
    ]

    return
