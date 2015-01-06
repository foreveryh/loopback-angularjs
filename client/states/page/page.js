angular.module('Shu.page', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('Shu.page')
.config(function($stateProvider) {
  $stateProvider.state('article', {
 		url: '/p/:id',
    templateUrl: 'states/page/article.html',
    resolve: {
    	article: function(Article, $stateParams){
    		return Article.findById({id: $stateParams.id})
    	} 	
    },
    controller: function($rootScope, $scope, $window, article){
    	$scope.$on('$stateChangeSuccess',function(evt, toState, toParams, fromState, fromParams){
      	$window.document.title = '——Shu';
      	$rootScope.bodylayout = "post reader-day-mode reader-font2";
       	//do action of fetching data here is also possible
       	$scope.article = article;
    	});
    }
  });
});

