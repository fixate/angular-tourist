angular.module 'angular.tourist'

  .directive 'tourStep', ['$tourist', '$window', '$injector', ($tourist, $window, $injector) ->
    restrict: 'EAC'
    controller: ['$scope', ($scope) ->
      @element = null

      _isFixed = (element) ->
        while element.parentNode.tagName != 'HTML'
          if $window.getComputedStyle(element)['position'] == 'fixed'
            return true
          element = element.parentNode

        return false

      # JQLite doesnt support offset, so we implement it here
      _boundingOffset = (element) ->
        return unless element?
        doc = element.ownerDocument
        documentElem = doc.documentElement
        documentOffset = if _isFixed(element) then { x: 0, y: 0 } else { x: $window.pageXOffset || documentElem.scrollLeft, y: $window.pageYOffset || documentElem.scrollTop }
        box = element.getBoundingClientRect?()

        return unless box?

        {
          top: box.top + (documentOffset.y) - (documentElem.clientTop || 0),
          left: box.left + (documentOffset.x) - (documentElem.clientLeft || 0),
          width: element.offsetWidth,
          height: element.offsetHeight
        }

      @activate = (step) =>
        if !_isFixed(@element[0])
          offset = @offset()
          scroll = {
            left: offset.left + offset.width / 2 - $window.innerWidth / 2
            top: offset.top + offset.height / 2 - $window.innerHeight / 2
          }

          step.activated ||= ['scroll', (scroll) ->
            $window.scrollTo(scroll.left, scroll.top)
          ]

          $injector.invoke(step.activated, @, scroll: scroll)

      @offset = () =>
        _boundingOffset(@element[0])

      @positioning = () =>
        pos = if _isFixed(@element[0]) then { position: 'fixed' } else { position: 'absolute' }
    ]
    link: (scope, element, attrs, ctrl) ->
      ctrl.element = element
      $tourist.registerStep(attrs.tourStep, ctrl)
  ]
