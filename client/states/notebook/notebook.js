angular.module('Shu.notebook', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('Shu.notebook')
.config(function($stateProvider) {
	$stateProvider.state('notebook', {
 		url: '/notebook/:id',
    templateUrl: 'states/notebook/notebook.html',
    // resolve: {
    // 	notebook: function(Notebook, $stateParams){
    // 		return Notebook.findById({id: $stateParams.id})
    // 	} 	
    // },
    controller: function($rootScope, $scope, $window){
    	$scope.$on('$stateChangeSuccess',function(evt, toState, toParams, fromState, fromParams){
      	$window.document.title = '——Shu';
      	$rootScope.bodylayout = "book output reader-day-mode reader-font2";
       	//do action of fetching data here is also possible
       	//$scope.notebook = notebook;
    	});
    }
  });
});