module.exports = function(Article) {
	Article.beforeValidate = function(next, article){
		next();
	};
	Article.beforeCreate = function(next, article){
		//Short ID
	  var shortId = require('shortid');
	  article.id = shortId.generate();
	  //Created date
	  article.created_at = new Date();
	  //Word count
	  var utility = require('../utility');
	  article.words_count = utility.countByteLength(article.content, 2)/2;
		next();

	};
	Article.beforeSave = function(next, article){
		next();
	};
};


