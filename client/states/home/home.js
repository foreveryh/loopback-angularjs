angular.module('Shu.home', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'ui.bootstrap.modal'])
  .config(function($stateProvider) {

    /* Add New States Above */

    $stateProvider
      .state('recommend', {
        url: '/',
        templateUrl: 'states/home/home.html',
        controller: 'HomeCtrl',
        listClass: 'thumbnails',
        data: {
          public: false
        }
      })
      .state('hottest', {
        url: '/hottest',
        templateUrl: 'states/home/home.html',
        controller: 'HomeCtrl',
        listClass: 'top-notes ranking',
        data: {
          public: true
        }
      });
  })
  .factory('homeShared', function(Article) {
    var sharedData = {
      initialized: false,
      homeState: false, // true - recommend, false - hottest
      recommendItems: [],
      hottestItems: []
    };

    function _fetchInitialData() {
      return Article.find({
          filter: {
            limit: 2
          }
        },
        function(list) {
          Array.prototype.push.apply(sharedData.recommendItems, list);
          Array.prototype.push.apply(sharedData.hottestItems, list);
        },
        function(error) {

        });
    };
    //load more data
    sharedData.fetchMoreData = function() {
      var _target = sharedData.homeState ? sharedData.recommendItems : sharedData.hottestItems;
      Article.find({
          filter: {
            limit: 3,
            skip: _target.length
          }
        },
        function(list) {
          Array.prototype.push.apply(_target, list);
          console.log("Load more successly");
        },
        function(error) {
          console.log(error);
        });
    };
    //get current items
    sharedData.getCurrentItems = function() {
      if (!sharedData.initialized) {
        _fetchInitialData();
        sharedData.initialized = true;
      }
      return sharedData.homeState ? sharedData.recommendItems : sharedData.hottestItems;
    };
    sharedData.setHomeState = function(state) {
      sharedData.homeState = state;
    }
    return sharedData;
  })
  .controller('HomeCtrl',
    function($rootScope, $scope, $window, Article, homeShared, $state) {

      $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
        $window.document.title = '首页 - 短篇 ';
        if (fromState.name !== 'recommend' && fromState.name !== 'hottest') {
          $rootScope.bodylayout = "output reader-day-mode reader-font2";
        }
        homeShared.setHomeState(toState.name !== "hottest" ? true : false);
        $scope.articles = homeShared.getCurrentItems();
      });
      $scope.loadMore = function() {
        homeShared.fetchMoreData();
      };
    });
