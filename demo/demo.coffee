angular.module 'angular.tourist.demo', [
  'angular.tourist'
]
  .config ['touristProvider', ($tour) ->
    $tour.define
      stepDefault:
        activeClass: 'highlight'
        position: 'south'
      steps: [
        {
          for: 'navigation'
          content: 'This is the {{ name }}!'
          setup: ($scope) ->
            $scope.extraNavItem = true
            console.log('step 1 setup', @.activeStep)

          teardown: ($scope) ->
            $scope.extraNavItem = false
            console.log('step 1 teardown', @.activeStep)

          values:
            name: 'Sidenav'
            position: 'north',
            title: 'This has a title!'
        }
        {
          for: 'exitNav'
          content: 'Exit the site?!'
          setup: ($scope) ->
            console.log('step 2 setup', @.activeStep)

          teardown: ($scope) ->
            console.log('step 2 teardown', @.activeStep)
        }
        {
          for: 'image'
          content: 'This image is random'
          setup: ($scope) ->
            console.log('step 2 setup', @.activeStep)

          teardown: ($scope) ->
            console.log('step 2 teardown', @.activeStep)
        }
        {
          for: 'paragraph'
          content: 'paragraph'
          setup: ($scope) ->
            console.log('step 2 setup', @.activeStep)

          teardown: ($scope) ->
            console.log('step 2 teardown', @.activeStep)
        }
      ]
      autostart: false
  ]

  .controller 'DemoCtrl', ['$scope', 'tourist', ($scope, tourist) ->
    $scope.startTour = ->
      tourist.start()

    $scope.endTour = ->
      tourist.end()

    tourist.on 'started', ->
      $scope.tourStarted = true

    tourist.on 'complete', ->
      $scope.tourStarted = false
  ]

  # Qtip wrapper directive
	.directive 'uiTooltip', ['$compile', ($compile) ->
		$ = angular.element
		unless $.fn.qtip?
			console.error?('QTip not included! Unable to use tooltip directive.')

		restrict: 'AEC'
		scope:
			content: '@'
			onRender: '&'
		link: (scope, element, attrs) ->
			options = scope.$eval(attrs.uiTooltip) || {}
			$ = angular.element

			el = $("<span>#{scope.content}</span>")
			compiler = $compile(el)

			$.extend(true, options,
				content:
					text: el
				style:
					tip:
						width: 16
						height: 8
				events:
					render: (event, api) ->
						scope.onRender(event: event, api: api)
						return
			)

			element.qtip(options)
			compiler(scope.$parent)
	]
