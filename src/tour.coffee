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
    promise = null
    template = @getTemplate()
    template.set($transitioning: true)
    promise = @emit('leave', @lastStep) if @lastStep?

    _continue = =>
      @emit('enter', @activeStep).then =>
        @showStep(template)
        template.set($transitioning: false)

    if promise?
      promise.then(_continue)
    else
      _continue()

  on: (event, handler) =>
    _this = @
    Tour.$rootScope.$on "$$tour-#{@name}-#{event}", ($event, $scope, $step) ->
      Tour.$injector.invoke(handler, _this, $scope: $scope, $step: $step, $event: $event)

  emit: (event, step = null) =>
    $scope = null
    rets = []
    if step
      $scope = @stepScope(step)
      if fns = step[event]
        for fn in fns
          # HACK: This to detect an inline function which cannot be invoked
          # with the injector
          ret = if fn.$$tourParsed?
            fn($scope)
          else
            Tour.$injector.invoke fn, @,
              $scope: $scope
              $step: step
              $element: @getController(step).element

          rets.push(ret)

    Tour.$rootScope.$emit("$$tour-#{@name}-#{event}", $scope, step)

    promises = []
    for ret in rets
      if ret? && ret.then?
        promises.push(ret)
      else
        q = Tour.$q.defer()
        q.resolve(ret)
        promises.push(q.promise)
    Tour.$q.all(promises)

  setActiveStep: (index) =>
    if index >= @steps.length
      @index = null
    else if index >= 0
      @lastStep = @getStep(@index) unless @index == false
      @index = index
      @activeStep = @getStep(index)
      true

  showStep: (template) =>
    ctrl = @getController()
    template.show(ctrl, @activeStep)
    ctrl.activate(@activeStep)

  enter: () =>
    el = @getController().element
    if @activeStep.activeClass?
      el.addClass(@activeStep.activeClass)

    if el.css('position') == 'static'
      el.css('position', 'relative')

  leave: () =>
    el = @getController(@lastStep).element
    if @activeStep.activeClass?
      el.removeClass(@activeStep.activeClass)

    el.css({ 'position': '' })

  getTemplate: () =>
    templateKey = @activeStep.template
    if typeof templateKey == 'function'
      templateKey = templateKey(@)
    template = Tour.templates[templateKey || 'default']
    template.setTour(@)
    template

  getController: (step = @activeStep) =>
    Tour.controllers[step.for]

  setSteps: (steps) =>
    @steps = []
    defaults = @options.stepDefault || {}
    for step in steps
      elemData = @getControllerStepData(step)
      newStep = angular.extend({}, defaults, step)
      # Store events callbacks from config and element
      angular.forEach Tour.EVT_PROPS, (evt) ->
        fn = newStep[evt]
        newStep[evt] = []
        newStep[evt].push(fn) if fn?
        newStep[evt].push(elemData[evt]) if elemData[evt]?
        delete elemData[evt]

      angular.extend(newStep, elemData)

      # Extend data
      if defaults.data?
        newStep.data = angular.extend({}, defaults.data, step.data, elemData.data)
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

    @.$get = ['$rootScope', '$parse', '$injector', '$q', ($rootScope, $parse, $injector, $q) ->
      _tours = {}

      # Tour dependencies
      Tour.$rootScope = $rootScope
      Tour.$parse = $parse
      Tour.$injector = $injector
      Tour.controllers = _stepCtrls
      Tour.templates = _templates
      Tour.$q = $q

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
