angular.module('Shu.home', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate']);

angular.module('Shu.home').config(function($stateProvider) {

    /* Add New States Above */

    $stateProvider
      .state('recommend', {
        url: '/recommend',
        templateUrl: 'states/home/home.html',
        controller: 'HomeCtrl',
        listClass: 'thumbnails'
      })
      .state('hottest', {
        url: '/hottest',
        templateUrl: 'states/home/home.html',
        controller: 'HomeCtrl',
        listClass: 'top-notes ranking'
      });
  })
  .controller('HomeCtrl', function($rootScope, $scope, $window, Article) {

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
      $window.document.title = '首页 - 短篇';
      if (fromState.name !== 'recommend' && fromState.name !== 'hottest') {
        $rootScope.bodylayout = "output reader-day-mode reader-font2";
      }
      if (toState.name === 'recommend') {
        $scope.articles = Article.find({
            filter: {
              limit: 5
            }
          },
          function(success) {},
          function(errorResponse) {});
      } else {
        $scope.articles = Article.find({
            filter: {
              limit: 10
            }
          },
          function(list) {
            /* success */
          },
          function(errorResponse) {
            /* error */
          });
      }
    });
  });
