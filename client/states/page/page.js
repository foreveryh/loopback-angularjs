angular.module('Shu.page', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'ngSanitize']);

angular.module('Shu.page')
  //Todo: 记录阅读数
  .config(function($stateProvider) {
    $stateProvider.state('article', {
      url: '/p/:id',
      templateUrl: 'states/page/article.html',
      resolve: {
        article: function(Article, $stateParams) {
          return Article.findOne({
              filter: {
                where: {
                  id: $stateParams.id
                }
              }
            },
            function(success) {
              console.log(success)
            },
            function(error) {
              console.log(error)
            });
        }
      },
      controller: function($rootScope, $scope, $window, $sce, article, Pageview, Article) {
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
          $window.document.title = article.title + " - 简书";
          $rootScope.bodylayout = "post output reader-day-mode reader-font2";
        });
        //default page view
        article.pageview_count = 1;
        $scope.article = article;
        //fetch page view count
        Article.pageview({
            id: article.id
          },
          function(success) {
            article.pageview_count = success.count + 1;
            //update page view count
            Pageview.upsert({
              id: success.id,
              count: article.pageview_count
            });
          },
          function(error) {
            Pageview.upsert({
              articleId: article.id,
              count: article.pageview_count
            });
          });
        $scope.deliberatelyTrustDangerousHtml = function() {
          return $sce.trustAsHtml($scope.article.content);
        };
      }
    });
  });
