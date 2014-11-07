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
    Tour.$rootScope.$on("$$tour-#{@name}-#{event}", handler)

  emit: (event, step = null) =>
    if step && fn = step[event]
      fn.apply(@, [@stepScope(step)])
    Tour.$rootScope.$emit("$$tour-#{event}", @, step)

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
    template.show(@getElement(), @activeStep)

  enter: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.addClass(@activeStep.activeClass)

  leave: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.removeClass(@activeStep.activeClass)

  getTemplate: () =>
    Tour.templates[@activeStep.template || 'default']

  getElement: (step = @activeStep) =>
    Tour.elements[step.for]

  setSteps: (steps) =>
    @steps = []
    defaults = @options.stepDefault || {}
    for step in steps
      newStep = angular.extend({}, defaults || {}, step, @getElementStepData(step))
      if defaults.data?
        newStep.data = angular.extend({}, defaults.data, step.data)
      @steps.push(newStep)
    return

  getElementStepData: (step) =>
    el = @getElement(step)
    return {} unless el?
    scope = el.scope()
    stepData = {}
    $parse = Tour.$parse
    angular.forEach Tour.PROPS.concat(Tour.EVT_PROPS), (prop) =>
      return unless value = el.attr("tour-#{prop}")
      if prop in Tour.EVT_PROPS
        value = $parse(value)
      else if prop == 'data'
        value = scope.$eval(value)

      stepData[prop] = value

    stepData

  getStep: () =>
    @steps[@index]

  stepScope: (step) =>
    angular.element(@getElement(step)).scope()


angular.module 'angular.tourist'

  .provider '$tourist', ->
    _tourOpts = {}
    _elements = {}
    _templates = {}

    @define = (name, options) ->
      if typeof name == 'object'
        options = name
        name = 'default'

      _tourOpts[name] = options
      return

    @.$get = ['$rootScope', '$parse', ($rootScope, $parse) ->
      _tours = {}

      # Tour dependencies
      Tour.$rootScope = $rootScope
      Tour.$parse = $parse
      Tour.elements = _elements
      Tour.templates = _templates

      {
        get: (name = 'default') ->
          throw "You have not defined a tour configuration for #{name}!" unless _tourOpts[name]?
          _tours[name] ||= new Tour(name, _tourOpts[name])

        registerStep: (name, element) ->
          _elements[name] = element

        registerTemplate: (name, ctrl) ->
          if typeof name == 'object'
            ctrl = name
            name = 'default'
          _templates[name || 'default'] = ctrl
      }
    ]

    return
