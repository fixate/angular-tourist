angular.module 'angular.tourist.demo', [
  'angular.tourist'
]
  .config ['$touristProvider', ($tour) ->
    $tour.define 'main',
      autostart: false
      stepDefault:
        activeClass: 'highlight'
        zIndex: 2000
        data:
          positionMy: "top left"
          positionAt: "left center"
      enter: ['$step', ($step) ->
        console.log("[enter] step #{$step.for}")
      ]
      leave: ['$step', ($step) ->
        console.log("[leave] step #{$step.for}")
      ]
      steps: [
        {
          for: 'navigation'
          content: 'This is the {{ $data.name }}!'
          enter: ['$scope', ($scope) ->
            $scope.navBorder = true
          ]

          leave: ['$scope', ($scope) ->
            $scope.navBorder = false
          ]

          data:
            name: 'Sidenav'
            title: 'Step 1'
            positionAt: "right center"
        }
        {
          for: 'exitNav'
          content: 'Exit the site?!'
        }
        {
          for: 'image'
          content: 'This image is random'
          data:
            positionMy: "center right"
            positionAt: "right center"
        }
        {
          for: 'paragraph'
          data:
            positionAt: "bottom center"
          enter: ['$animate', '$element', ($animate, $element) ->
            $animate.addClass($element, 'animate-paragraph').then ->
              console.log('finished')
          ]

          leave: ['$animate', '$element', ($animate, $element) ->
            $animate.removeClass($element, 'animate-paragraph')
          ]
        }
        {
          for: 'another-image'
          content: 'Another image which we have to auto scroll to.'
          data:
            positionMy: 'left center'
            positionAt: "right center"
        }
      ]
  ]

  .controller 'DemoCtrl', ['$scope', '$tourist', '$timeout', ($scope, $tourist, $timeout) ->
    tour = $tourist.get('main')
    $scope.startTour = ->
      tour.start()

    $scope.endTour = ->
      tour.end()

    tour.on 'started', ->
      $scope.tourStarted = true

    tour.on 'complete', ->
      $scope.tourStarted = false
  ]

  # Qtip wrapper directive
  .directive 'uiTooltip', ['$compile', ($compile) ->
    $ = angular.element
    unless $.fn.qtip?
      console.error?('QTip not included! Unable to use tooltip directive.')

    restrict: 'AEC'
    transclude: true
    scope:
      content: '@'
      onRender: '&'
      reposition: '='
      positionMy: '='
      positionAt: '='
    link: (scope, element, attrs, ctrl, $transclude) ->
      options = scope.$eval(attrs.uiTooltip) || {}
      $ = angular.element

      qtip = (content) ->
        angular.extend(options,
          prerender: true
          content:
            text: content
          hide:
            event: false
          show:
            event: 'click'
          events:
            render: (event, api) ->
              scope.onRender(event: event, api: api)
              return
        )

        element.qtip(options).qtip('show')

      if scope.content
        el = $("<span>#{scope.content}</span>")
        compiler = $compile(el)
        compiler(scope.$parent)
        qtip(el)
      else
        $transclude (clone) ->
          el = $("<span></span>")
          el.append(clone)
          qtip(el)
          return

      api = element.qtip('api')

      scope.$watch 'content', (content) ->
        api.set('content.text', content)

      scope.$watch 'positionMy', (position) ->
        return unless position?
        api.set('position.my', position)

      scope.$watch 'positionAt', (position) ->
        return unless position?
        api.set('position.at', position)

      scope.$watch 'reposition', ->
        api.reposition()

      scope.$on '$destroy', ->
        api.hide()

      return
  ]
