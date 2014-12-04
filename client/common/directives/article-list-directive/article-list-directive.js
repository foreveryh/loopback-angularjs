angular.module('Shu.home').directive('articleListDirective', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'common/directives/article-list-directive/article-list-directive.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});