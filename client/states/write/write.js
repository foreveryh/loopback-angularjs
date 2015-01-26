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
      },
      notebooks: function(Notebook){
           //Notebook Items
        return Notebook.find({
          filter: { limit: 10 }},
          function(list) { 
          /* success */ 
            console.log("load notebooks ok");
          },
          function(errorResponse) { 
          /* error */ 
        });
      }
    },
    controller: function($rootScope, $scope, $window, Article, notebooks){
      $scope.$on('$stateChangeSuccess',function(evt, toState, toParams, fromState, fromParams){
        $window.document.title = '——Shu';
        $rootScope.bodylayout = "input reader-day-mode reader-font2";
      });
      $scope.notebooks = notebooks;
      $scope.selectedNotebookID = "";
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
        angular.forEach($scope.notebooks, function(notebook){
          if (selectedActivedItem.name == notebook.name){
            $scope.selectedNotebookID = notebook.id;
          }
        });
        console.log($scope.selectedNotebookID);
      };
      this.addItem = function (item){
        items.push(item);
      };
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
.directive("articleListEditor", function(Notebook,Article){
   return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    //scope: true,
    templateUrl: "states/write/article-list-editor.html",
    controller: function($scope){
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
      //
      $scope.articles = [{title: '1', contetn: 'good'},{title: '2', contetn: 'good'},{title: '3', contetn: 'good'}];
    },
    link: function(scope, element, attrs){
      scope.$watch('selectedNotebookID', function() {
        console.log('reload:' + scope.selectedNotebookID);
        scope.articles = Notebook.articles({
          id: scope.selectedNotebookID,
          filter: {
            limit: 10
          }},
          function(response){
            console.log(response);
          },
          function(errorResponse){
            console.log(errorResponse);
          });
        console.log(scope.articles);
      })
    }};
})
.directive("articleItemEditor", function(){
  return {
    restrict: 'EA',
    replace: true,
    require: '^?articleListEditor',
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