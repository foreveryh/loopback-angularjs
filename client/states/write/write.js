angular.module('Shu.write', ['ui.bootstrap','ui.utils','ui.router','ngAnimate','oc.lazyLoad']);

angular.module('Shu.write').config(function($stateProvider) {

	$stateProvider.state('write', {
 		url: '/write',
 		templateUrl: 'states/write/write.html',
 		resolve:{  
 			// Any property in resolve should return a promise and is executed before the view is loaded
			 loadMyCtrl: function($ocLazyLoad) {
         // you can lazy load files for an existing module
         return $ocLazyLoad.load({
            name: 'textAngular',
            files: ['http://cdn.jsdelivr.net/g/angular.textangular@1.2.2(textAngular-sanitize.min.js+textAngular.min.js)']
         });
      }
    },
    controller: function($rootScope, $scope, $window, Article){
      $scope.$on('$stateChangeSuccess',function(evt, toState, toParams, fromState, fromParams){
        $window.document.title = '——Shu';
        $rootScope.bodylayout = "input reader-day-mode reader-font2";
      });
      $scope.btnTitle = "保存";
      $scope.save = function(){
        console.log($scope.htmlVariable);
        Article.create({
          "title": "Post测试",
          "summary": "Post测试",
          "content": $scope.htmlVariable,
          "author": "测试"
        },function(result){
            alert("Post success");
            console.log(result);
        },
          function(errorResponse){
            alert("post failed");
            console.log(errorResponse);
        });
      }
    }
  });
});

