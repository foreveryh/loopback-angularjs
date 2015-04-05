angular.module('Shu.page', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'ngSanitize']);

angular.module('Shu.page')
  //Todo: 记录阅读数
  .config(function($stateProvider) {
    $stateProvider.state('article', {
      url: '/p/:id',
      templateUrl: 'states/page/article.html',
      resolve: {
        article: function(Article, $stateParams) {
          return Article.findById({
            id: $stateParams.id
          })
        }
      },
      controller: function($rootScope, $scope, $window, $sce, article, Pageview) {
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
          $window.document.title = article.title + " - 简书";
          $rootScope.bodylayout = "post output reader-day-mode reader-font2";
        });
        $scope.article = article;
        $scope.deliberatelyTrustDangerousHtml = function() {
          return $sce.trustAsHtml($scope.article.content);
        };
        //update page view #2
        Pageview.upsert({
            articleId: article.id,
            count: 100
          },
          function(success) {
            console.log(success);
          },
          function(error) {
            console.log(error);
          }
        );
      }
    });
  });
