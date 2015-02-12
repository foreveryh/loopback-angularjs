angular.module('Shu.write', ['ui.bootstrap', 'ui.utils', 'ui.router', 'Shu.utility', 'ngAnimate', 'oc.lazyLoad']);

angular.module('Shu.write')
  .config(function($stateProvider) {

    $stateProvider.state('write', {
      url: '/write',
      templateUrl: 'states/write/write.html',
      resolve: {
        // Any property in resolve should return a promise and is executed before the view is loaded
        loadMyCtrl: function($ocLazyLoad) {
          // you can lazy load files for an existing module
          return $ocLazyLoad.load({
            name: 'textAngular',
            files: ['http://cdn.jsdelivr.net/g/angular.textangular@1.2.2(textAngular-sanitize.min.js+textAngular.min.js)']
          });
        },
        notebooks: function(Notebook, sharedData) {
          //Notebook Items
          return Notebook.find({
              filter: {
                limit: 10
              }
            },
            function(list) {
              /* success */
              console.log("load notebooks ok");
              sharedData.notebooks = list;
            },
            function(errorResponse) {
              /* error */
            });
        }
      },
      controller: function($rootScope, $scope, $window, sharedData) {
        $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {
          $window.document.title = '——Shu';
          $rootScope.bodylayout = "input reader-day-mode reader-font2";
        });
        $scope.$on('selectedArticle:changed', function(event) {
          $scope.selectedArticle = sharedData.getSelectedArticle();
        });
      },
      controllerAs: 'writeCtrl'
    });
  })
  .factory('sharedData', function($rootScope) {
    var sharedData = {
      notebooks: [],
      allArticles: [],
      currentArticles: [],
      selectedNotebookId: null,
      selectedArticle: {}
    };

    sharedData.selectedNotebookIdChanged = function(notebookId) {
      sharedData.selectedNotebookId = notebookId;
      sharedData._deselectArticle();
      $rootScope.$broadcast('notebook:changed', notebookId);
      $rootScope.$broadcast('articles:changed');
    };

    sharedData.setCurrentArticles = function(articles) {
      sharedData.currentArticles = articles;
      $rootScope.$broadcast('articles:changed', articles);
    };
    sharedData.getCurrentArticles = function() {
      console.log("length:" + sharedData.currentArticles.length);
      return sharedData.currentArticles;
    };
    sharedData.removeOneArticle = function(articleId) {
      angular.forEach(sharedData.currentArticles, function(article, index) {
        if (article.id == articleId) {
          sharedData.currentArticles.splice(index, 1);
        }
      });
      if (sharedData.selectedArticle.id == articleId) {
        sharedData.setSelectedArticle({});
      }
      $rootScope.$broadcast('articles:changed');
    };
    sharedData.setSelectedArticle = function(article) {
      sharedData.selectedArticle = article;
      $rootScope.$broadcast('selectedArticle:changed');
    };
    sharedData.getSelectedArticle = function() {
      console.log("Title: " + sharedData.selectedArticle.title);
      return sharedData.selectedArticle;
    };
    sharedData._deselectArticle = function() {
      sharedData.selectedArticle = {};
    }
    return sharedData;
  })
  .directive("notebookListEditor", function($timeout, Notebook, sharedData) {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      templateUrl: "states/write/notebook-list-editor.html",
      controller: function($scope, Notebook) {
        $scope.notebooks = sharedData.notebooks;

        var items = [];
        this.activeOne = function(selectedActivedItem) {
          angular.forEach(items, function(item) {
            if (selectedActivedItem != item) {
              item.active = false;
            }
          });
          //reset selected notebook
          if (sharedData.selectedNotebookId != selectedActivedItem.id) {
            sharedData.selectedNotebookIdChanged(selectedActivedItem.id);
            sharedData.currentArticles = [];
          }
        };

        this.addItem = function(item) {
          items.push(item);
        };

        this.defaultOne = function() {
          if (items.length) {
            var firstItem = items[0];
            firstItem.active = true;
            sharedData.selectedNotebookIdChanged(firstItem.id);
          }
        };

        //New Notebook Form
        $scope.isCollapsed = true;
        $scope.newNotebook = {};
        $scope.newNotebookForm = function() {
          var notebookName = $scope.newNotebook.name ? $scope.newNotebook.name : "无标题";
          Notebook.create({
              "name": notebookName
            }, function(result) {
              $scope.isCollapsed = true;
              $scope.notebooks.push(result);
            },
            function(errorResponse) {
              console.log(errorResponse);
            });
        };
        //watch selected notebook change
        $scope.selectedNotebookId = sharedData.selectedNotebookId;
        $scope.$on('notebook:changed', function(event, notebookId) {
          console.log("notebook:changed");
          var isSelectedNotebookExist = false;
          var thisNotebookId = sharedData.selectedNotebookId;
          angular.forEach(sharedData.allArticles, function(notebook) {
            if (notebook.notebookId == thisNotebookId) {
              sharedData.currentArticles = notebook.articles;
              isSelectedNotebookExist = true;
            }
          });
          if (!isSelectedNotebookExist && thisNotebookId != null) {
            var relatedArticles =
              Notebook.articles({
                  id: thisNotebookId
                },
                function(list) {
                  console.log("loaded all articles of related notebook");
                  sharedData.allArticles.push({
                    notebookId: thisNotebookId,
                    articles: list
                  });
                  sharedData.setCurrentArticles(list);
                },
                function(errorResponse) {
                  console.log(errorResponse);
                }
              );
          }
        });
      },
      link: function postLink(scope, element, attr, controller) {
        $timeout(function() {
          controller.defaultOne();
        });
      }
    };
  })
  .directive("notebookItemEditor", function() {
    return {
      restrict: 'EA',
      replace: true,
      require: '^?notebookListEditor',
      scope: {
        name: '=notebookName',
        id: '=notebookId'
      },
      templateUrl: "states/write/notebook-item-editor.html",
      link: function(scope, element, attrs, parentController) {
        scope.active = false;
        parentController.addItem(scope);
        scope.activeMe = function() {
          scope.active = true;
          parentController.activeOne(scope);
        };
        scope.editMe = function() {

        };
      }
    };
  })
  .directive("articleListEditor", function(sharedData, Article) {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      templateUrl: "states/write/article-list-editor.html",
      controller: function($scope) {
        $scope.$on('articles:changed', function(event) {
          $scope.currentArticles = sharedData.getCurrentArticles();
        });

        var items = [];
        this.activeOne = function(selectedActivedItem) {
          angular.forEach(items, function(item) {
            if (selectedActivedItem != item) {
              //inactive 
              item.active = false;
              if (typeof(item.titleListener) == 'function') {
                item.titleListener();
              }
              if (typeof(item.contentListener) == 'function') {
                item.contentListener();
              }
            }
          });
          //set data to writer 
          var activeActicle = {
            id: selectedActivedItem.id,
            title: selectedActivedItem.title,
            content: selectedActivedItem.text
          };
          sharedData.setSelectedArticle(activeActicle);
        };
        this.addItem = function(item) {
          items.push(item);
        };
        //create article
        $scope.createArticle = function(position) {

          Article.create({
            title: "无标题文章",
            content: "无内容",
            is_published: true,
            notebookId: sharedData.selectedNotebookId,
            authorId: 1
          }, function(result) {
            console.log("create article successfully");
            if (position != "start") {
              $scope.currentArticles.push(result);
            } else {
              $scope.currentArticles.unshift(result);
            }
          }, function(errorResponse) {
            console.log(errorResponse);
          });
        };
      }
    };
  })
  .directive("articleItemEditor", function($modal, utility, sharedData, Article) {
    return {
      restrict: 'EA',
      replace: true,
      require: '^?articleListEditor',
      scope: {
        title: '=articleTitle',
        text: '=articleText',
        id: '=articleId'
      },
      templateUrl: "states/write/article-item-editor.html",
      controller: function($scope) {
        $scope.publishArticle = function() {
          Article.upsert({
              id: $scope.id,
              is_published: true
            },
            function(ok) {
              console.log(ok);
            });
        };
        $scope.deleteArticle = function() {
          var modalInstance = $modal.open({
            templateUrl: 'RemoveAritcleModal.html',
            controller: 'RemoveModalInstanceCtrl',
            resolve: {
              article: function() {
                return {
                  title: $scope.title,
                  id: $scope.id
                }
              }
            },
            size: "sm"
          });
        };
        $scope.moveArticle = function() {

        };
      },
      link: function(scope, element, attrs, parentController) {
        scope.active = false;
        parentController.addItem(scope);

        scope.activeMe = function() {
          scope.active = true;
          scope.titleListener = scope.$watch('$parent.selectedArticle.title', function() {
            var articleTitle = sharedData.selectedArticle.title;
            if (articleTitle && scope.title != sharedData.selectedArticle.title) {
              scope.title = sharedData.selectedArticle.title;
            }
          });
          scope.contentListener = scope.$watch('$parent.selectedArticle.content', function() {
            var contentText = sharedData.selectedArticle.content;
            var contentText = contentText ? utility.strip_tags(contentText) : false;
            if (contentText && scope.text != contentText) {
              scope.text = contentText;
            }
          });
          parentController.activeOne(scope);
        };
      }
    };
  }).
controller("RemoveModalInstanceCtrl", function($scope, $modalInstance, sharedData, article, Article) {
  $scope.article = article;
  $scope.ok = function() {
    console.log($scope.article);
    //remove article from Database
    Article.deleteById({
        id: $scope.article.id
      },
      function(ok) {
        sharedData.removeOneArticle($scope.article.id);
      },
      function(errorResponse) {
        console.log(errorResponse);
      }
    );
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
});
