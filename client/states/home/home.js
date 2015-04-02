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
    var defaultState = false; // true - recommend, false - hottest
    var recommendItems = Article.find({
        filter: {
          limit: 2
        }
      },
      function(success) {},
      function(error) {});

    var hottestItems = Article.find({
        filter: {
          limit: 2
        }
      },
      function(list) {
        /* success */
      },
      function(error) {
        /* error */
      });

    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
      $window.document.title = '首页 - 短篇';
      if (fromState.name !== 'recommend' && fromState.name !== 'hottest') {
        $rootScope.bodylayout = "output reader-day-mode reader-font2";
      }
      defaultState = toState !== "hottest" ? true : false;
      $scope.articles =  defaultState ? recommendItems: hottestItems;
 
    });
    $scope.loadMore = function() {

      var skipLen = defaultState ? recommendItems.length : hottestItems.length;
      Article.find({
        filter: {
          limit: 2,
          skip: skipLen
        }
      },
      function(success){
        if (defaultState) {
          Array.prototype.push.apply(recommendItems, success);
          console.log("Load more successly");
        }else{
          Array.prototype.push.apply(hottestItems,success);
        }
      },
      function(error){
        console.log(error);
      });
    };

  });
