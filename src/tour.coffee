class Tour
  @PROPS = ['content', 'values']
  @EVT_PROPS = ['enter', 'leave', 'completed', 'started']

  constructor: (options) ->
    @options = options
    @elements = {}
    @templates = {}
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
    Tour.$rootScope.$on("$$tour-#{event}", handler)

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
    @getTemplate().show(@getElement(), @activeStep)

  enter: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.addClass(@activeStep.activeClass)

  leave: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.removeClass(@activeStep.activeClass)

  getTemplate: () =>
    @templates[@activeStep.template || 'default']

  getElement: (step = @activeStep) =>
    @elements[step.for]

  setSteps: (steps) =>
    @steps = []
    defaults = @options.stepDefault || {}
    for step in steps
      newStep = angular.extend({}, defaults || {}, step, @getElementStepData(step))
      if defaults.values?
        newStep.values = angular.extend({}, defaults.values, step.values)
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
      else if prop == 'values'
        value = scope.$eval(value)

      stepData[prop] = value

    stepData


  getStep: () =>
    @steps[@index]

  stepScope: (step) =>
    angular.element(@elements[step.for]).scope()

  registerStep: (name, element) =>
    @elements[name] = element

  registerTemplate: (name, ctrl) =>
    @templates[name || 'default'] = ctrl

angular.module 'angular.tourist'

  .provider 'tourist', ->
    _tourOptions = null

    @define = (options) ->
      _tourOptions = options
      return

    @.$get = ['$injector', '$rootScope', '$parse', ($injector, $rootScope, $parse) ->
      throw "You have not defined a tour configuration!" unless _tourOptions?
      Tour.$rootScope = $rootScope
      Tour.$injector = $injector
      Tour.$parse = $parse
      new Tour(_tourOptions)
    ]

    return
