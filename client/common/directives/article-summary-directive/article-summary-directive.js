angular.module('Shu.home').directive('articleSummaryDirective', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: true,
		templateUrl: 'common/directives/article-summary-directive/article-summary-directive.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
