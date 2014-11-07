angular.module 'angular.tourist.demo', [
  'angular.tourist'
]
  .config ['$touristProvider', ($tour) ->
    $tour.define 'main',
      autostart: false
      stepDefault:
        activeClass: 'highlight'
        data:
          position: "top left"
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
        }
        {
          for: 'exitNav'
          content: 'Exit the site?!'
          data:
            position: "bottom left"
        }
        {
          for: 'image'
          content: 'This image is random'
          data:
            position: "center right"
        }
        {
          for: 'paragraph'
        }
      ]
  ]

  .controller 'DemoCtrl', ['$scope', '$tourist', ($scope, $tourist) ->
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
          position: scope.position
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

      scope.$watch 'reposition', ->
        api.reposition()

      scope.$on '$destroy', ->
        api.hide()

      return
  ]
