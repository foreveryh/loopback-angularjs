angular.module('Shu.page', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'ngSanitize']);

angular.module('Shu.page')
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
      controller: function($rootScope, $scope, $window, $sce, article) {
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
          $window.document.title = '——Shu';
          $rootScope.bodylayout = "post output reader-day-mode reader-font2";
        });
        $scope.article = article;
        $scope.deliberatelyTrustDangerousHtml = function() {
          return $sce.trustAsHtml($scope.article.content);
        };
      }
    });
  });
