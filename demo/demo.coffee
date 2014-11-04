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
          before: ['$scope', ($scope) ->
            $scope.name = "Blah!"
          ]
          position: 'north',
          title: 'This has a title!'
        }
        {
          for: 'exitNav'
          content: 'Exit the site?!'
        }
        {
          for: 'image'
          content: 'This image is random'
        }
        {
          for: 'paragraph'
          content: 'paragraph'
        }
      ]
      autostart: false
  ]

  .controller 'DemoCtrl', ['$scope', 'tourist', ($scope, tourist) ->
    $scope.startTour = ->
      tourist.start()
  ]
