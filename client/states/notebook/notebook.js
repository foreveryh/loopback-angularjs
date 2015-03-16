angular.module('Shu.notebook', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate']);

angular.module('Shu.notebook')
  .config(function($stateProvider) {
    $stateProvider.state('notebook', {
      url: '/notebook/:id',
      templateUrl: 'states/notebook/notebook.html',
      resolve: {
       notebook: function(Notebook, $stateParams){
        var notebook = Notebook.findById(
          {id: $stateParams.id},
          function(result){
            notebook.articles = Notebook.articles({id: $stateParams.id});
          });
        return notebook;
        }   
      },
      controller: function($rootScope, $scope, $window, notebook) {
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
          $window.document.title = notebook.name + " - 文集 -简书";
          $rootScope.bodylayout = "book output reader-day-mode reader-font2";
          //do action of fetching data here is also possible
          //$scope.notebook = notebook;
        });
        $scope.notebook = notebook;
      }
    });
  });
