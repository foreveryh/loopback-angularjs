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
      $scope.selectedNotebook = null;
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
    },
    controllerAs: 'writeCtrl'
  });
})
.directive("notebookListEditor", function(){
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    templateUrl: "states/write/notebook-list-editor.html",
    controller: function($scope, Notebook){
     
      var items = [];
      this.activeOne = function(selectedActivedItem) {
        angular.forEach(items, function(item){
          if (selectedActivedItem != item) {
            item.active = false;
          }
        });
        $scope.$parent.selectedNotebook = selectedActivedItem.name;
        console.log("selectedNotebook:"+ $scope.$parent.selectedNotebook);
      };
      this.addItem = function (item){
        items.push(item);
      };
      //Notebook Items
      $scope.notebooks = Notebook.find({
        filter: { limit: 10 }},
        function(list) { 
        /* success */ 
        },
        function(errorResponse) { 
        /* error */ 
      });
      //New Notebook Form
      $scope.isCollapsed = true;
      $scope.newNotebook = {};
      $scope.newNotebookForm = function(){
        var notebookName = $scope.newNotebook.name? $scope.newNotebook.name : "无标题"; 
        Notebook.create({
          "name": notebookName
        },function(result){
            $scope.isCollapsed = true;
            $scope.notebooks.push(result);
        },
          function(errorResponse){
            alert("post failed");
            console.log(errorResponse);
        });
      };
    }
  };
})
.directive("notebookItemEditor", function(){
  return {
    restrict: 'EA',
    replace: true,
    require: '^?notebookListEditor',
    scope: { name: '=notebookName' },
    templateUrl: "states/write/notebook-item-editor.html",
    link: function(scope, element, attrs, parentController){
      scope.active = false;
      parentController.addItem(scope);
      scope.activeMe = function(){
        scope.active = true;
        parentController.activeOne(scope);
      };
      scope.editMe = function(){
        
      };
    }
  };
})
.directive("articleListEditor", function(){
   return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    templateUrl: "states/write/article-list-editor.html",
    controller: function($scope, Notebook){
      var items = [];
      this.activeOne = function(selectedActivedItem) {
        angular.forEach(items, function(item){
          if (selectedActivedItem != item) {
            item.active = false;
          }
        });
      };
      this.addItem = function (item){
        items.push(item);
      };
    },
    link: function(scope, element, attrs){
      scope.$watch('$parent.selectedNotebook', function() {
        alert('hey, myVar has changed!');
      });
    }};
})
.directive("articleItemEditor", function(){
  return {
    restrict: 'EA',
    replace: true,
    require: '^?ArticleListEditor',
    scope: { title: '=articleTitle', text:'=articleText' },
    templateUrl: "states/write/article-item-editor.html",
    link: function(scope, element, attrs, parentController){
      scope.active = false;
      parentController.addItem(scope);
      scope.activeMe = function(){
        scope.active = true;
        parentController.activeOne(scope);
      };
      scope.editMe = function(){
        
      };
    }
  };
});