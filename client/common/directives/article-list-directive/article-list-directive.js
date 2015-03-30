angular.module('Shu.home').directive('articleListDirective', function($state) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: 'common/directives/article-list-directive/article-list-directive.html',
    link: function(scope, element, attrs, fn) {
      var enterClass = $state.current.listClass;
      var ulElm = element.children(0).first();
      ulElm.addClass(enterClass);
      scope.$on('$destroy', function() {
        ulElm.removeClass(enterClass);
        ulElm.addClass($state.current.listClass);
      })
    }
  };
});
