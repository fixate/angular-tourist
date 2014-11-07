describe 'Directive: tour-step', ->
  touristMock = null
  element = null

  beforeEach module('angular.tourist')
  beforeEach ->
    module ($compile, $rootScope) ->
      scope = $rootScope.$new()
      element = angular.element('<div tour-step="dummy-step"></div>')
      element = $compile(element)(scope)
      scope.$apply()

  beforeEach(module(($provide) ->
    console.log('sdfsd')
    touristMock = {
      registerStep: () ->
    }

    spyOn(touristMock, 'registerStep')

    $provide.value('$tourist', touristMock)
  ))

  it 'registers itself', ->
    expect(touristMock.registerStep).toHaveBeenCalledWith('dummyStep', element)



