angular.module('Shu.home', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('Shu.home').config(function($stateProvider) {

    /* Add New States Above */

    $stateProvider
    .state('recommend', {
   		url: '/recommend',
   		templateUrl: 'states/home/home.html',
    })
    .state('hottest', {
      url: '/hottest',
      templateUrl: 'states/home/home.html',
    });
})
.controller('HomeCtrl', function($rootScope, $scope, $window){
	  $scope.$on('$stateChangeSuccess',function(evt, toState, toParams, fromState, fromParams){
    $window.document.title = '首页';
    $rootScope.bodylayout = "output reader-day-mode reader-font2";
  });
})
.controller('RecommendCtrl',function($scope){

	$scope.articles = [
		{
			title: "时光荏苒，不负青春——我的13到14",
			text : "选择一座城，便选择了一段人生。 在爱情里，我好像从不畏惧未来，我是认真的傻着，不去想未来，只要当下。选择一个人，然后跟随他奔赴一个完全陌生的城市。 在最初的日子里，我的大部分时间都是窝在家里看书、写字。这里没有朋友，好像完全被封闭起来，我并不享受这份自由，觉得很压抑。",
			author: "丢了朵朵",
			notebook: "随笔",
			collection: "玩趣",
			like: 100,
			isBookMarded: false
	},
		{
			title: "火车 · 旅人——失意的中年男子",
			text : "我买了一张从杭州能够一趟往北走的最远的火车票，终点是齐齐哈尔，硬座，33个小时，大约一天两夜，下午出发。难以置信的便宜，才258块，还带了完全可以忽略的几角几分的零头。 一直到屁股贴在座位上，我都不敢相信，就这么出发了，带了一个大点尺寸放电脑的双肩包，里面是我计算好的到中国最北面所需的物",
			author: "taoyh",
			notebook: "随笔",
			collection: "玩趣",
			like: 100,
			isBookMarded: false
	},
	{
			title: "火车 · 旅人——失意的中年男子",
			text : "我买了一张从杭州能够一趟往北走的最远的火车票，终点是齐齐哈尔，硬座，33个小时，大约一天两夜，下午出发。难以置信的便宜，才258块，还带了完全可以忽略的几角几分的零头。 一直到屁股贴在座位上，我都不敢相信，就这么出发了，带了一个大点尺寸放电脑的双肩包，里面是我计算好的到中国最北面所需的物",
			author: "taoyh",
			notebook: "随笔",
			collection: "玩趣",
			like: 100,
			isBookMarded: false
	},
	{
			title: "火车 · 旅人——失意的中年男子",
			text : "我买了一张从杭州能够一趟往北走的最远的火车票，终点是齐齐哈尔，硬座，33个小时，大约一天两夜，下午出发。难以置信的便宜，才258块，还带了完全可以忽略的几角几分的零头。 一直到屁股贴在座位上，我都不敢相信，就这么出发了，带了一个大点尺寸放电脑的双肩包，里面是我计算好的到中国最北面所需的物",
			author: "taoyh",
			notebook: "随笔",
			collection: "玩趣",
			like: 100,
			isBookMarded: false
	},
	{
			title: "火车 · 旅人——失意的中年男子",
			text : "我买了一张从杭州能够一趟往北走的最远的火车票，终点是齐齐哈尔，硬座，33个小时，大约一天两夜，下午出发。难以置信的便宜，才258块，还带了完全可以忽略的几角几分的零头。 一直到屁股贴在座位上，我都不敢相信，就这么出发了，带了一个大点尺寸放电脑的双肩包，里面是我计算好的到中国最北面所需的物",
			author: "taoyh",
			notebook: "随笔",
			collection: "玩趣",
			like: 100,
			isBookMarded: false
	}
	];
})
.controller('HottestCtrl',function($scope, Article){

	$scope.articles = Article.find({
  	filter: { limit: 10 }},
  	function(list) { 
  		/* success */ 
  		alert("Success");
  	},
  	function(errorResponse) { 
  		/* error */ 
  		alert("Failed");
  });
});

