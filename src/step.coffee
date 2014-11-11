angular.module 'angular.tourist'

  .directive 'tourStep', ['$tourist', '$window', '$injector', ($tourist, $window, $injector) ->
    restrict: 'EAC'
    controller: ['$scope', ($scope) ->
      @element = null

      # JQLite doesnt support offset, so we implement it here
      _boundingOffset = (element) ->
        return unless element?
        doc = element.ownerDocument
        documentElem = doc.documentElement
        box = element.getBoundingClientRect?()

        return unless box?

        {
          top: box.top + ($window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
          left: box.left + ($window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0),
          width: element.offsetWidth,
          height: element.offsetHeight
        }

      @activate = (step) =>
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
    ]
    link: (scope, element, attrs, ctrl) ->
      ctrl.element = element
      $tourist.registerStep(attrs.tourStep, ctrl)
  ]
