angular.module 'angular.tourist'

  .constant 'Tour', ->
    class Tour
      @_DEPS = {}
      @PROPERTIES = ['for', 'content', 'before', 'after']

      constructor: (@steps, @defaults) ->
        @index = false
        @scopes = {}
        @lastStep = null

      start: (at = 0) =>
        return unless @index == false
        @index = at
        @process()

      next: =>
        @index ++
        @process()

      process: () =>
        @beforeCallbacks()
        @applyTemplate()

      activeStep: =>
        return null if @index == false
        @extendStep(@steps[@index])

      extendStep: (step) =>
        angular.extend(true, @options.stepDefault, step)

  .provider 'tourist', ['Tour', (Tour) ->

    _tour = null

    @define = (options) =>
      _tour = new Tour(options.steps, options.stepDefault)
      if options.autostart
        _tour.start()
      return

    @.$get = ['$injector', ($injector) ->
      {
        tour: () -> _tour,
        start: () -> _tour.start()
        registerStep: (name, scope) ->
          _tour.scopes[name] = scope
      }
    ]

    return
  ]
