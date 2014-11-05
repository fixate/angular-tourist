class Tour
  constructor: (options) ->
    @options = options
    @setSteps(options.steps)
    @elements = {}
    @templates = {}
    @reset()
    @on('setup', options.setup) if options.setup?
    @on('teardown', options.teardown) if options.teardown?
    @on('setup', @setup)
    @on('teardown', @teardown)

    if @options.autostart
      @start()

  reset: () =>
    @index = false
    @activeStep = null
    @lastStep = null

  start: (at = 0) =>
    unless @activeStep?
      @setActiveStep(at)
      @activate()
      @emit('started')

  end: =>
    if @activeStep?
      @emit('teardown', @activeStep)
      @getTemplate().hide()
      @emit('complete')
      @reset()

  next: =>
    if @setActiveStep(@index + 1)
      @activate()
    else
      @end()

  previous: =>
    if @setActiveStep(@index - 1)
      @activate()

  activate: () =>
    @emit('teardown', @lastStep) if @lastStep?
    @emit('setup', @activeStep)
    @showStep()

  on: (event, handler) =>
    Tour.$rootScope.$on("$$tour-#{event}", handler)

  emit: (event, step = null) =>
    if step && fn = step[event]
      fn.apply(@, [@stepScope(step)])
    Tour.$rootScope.$emit("$$tour-#{event}", @)

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

  setup: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.addClass(@activeStep.activeClass)

  teardown: () =>
    el = @getElement()
    if @activeStep.activeClass?
      el.removeClass(@activeStep.activeClass)

  getTemplate: () =>
    @templates[@activeStep.template || 'default']

  getElement: () =>
    @elements[@activeStep.for]

  setSteps: (steps) =>
    @steps = []
    for step in steps
      @steps.push(angular.extend({}, @options.stepDefault || {}, step))
    return

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

    @define = (options) =>
      _tourOptions = options
      return

    @.$get = ['$injector', '$rootScope', ($injector, $rootScope) ->
      Tour.$rootScope = $rootScope
      Tour.$injector = $injector
      new Tour(_tourOptions)
    ]

    return
