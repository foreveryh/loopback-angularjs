module.exports = function(Article) {
  var shortId = require('shortid');
  Article.observe('before save', function(ctx, next) {
  	var article;
    if (ctx.instance) {
      article = ctx.instance;
      //Short ID  
      article.id = shortId.generate();
      //Created date
      article.created_at = new Date();
    } else {
     	article = ctx.data;
      article.updated_at = new Date();
    }
    if (article.content) {
      //generate 文章的摘要
      article.summary = article.content.subCHString(0, 100);
      //Word count
      article.words_count = article.content.strLen();
    }
    next();
  });
  //
  String.prototype.strLen = function() {
    var len = 0,
      offset;
    for (var i = 0, tmp = this.length; i < tmp; i++) {
      offset = (this.isCHS(i)) ? 2 : 1;
      len += offset;
    }
    return len;
  };

  String.prototype.strToChars = function() {
    var chars = [];
    for (var i = 0, tmp = this.length; i < tmp; i++) {
      chars[i] = [this.substr(i, 1), this.isCHS(i)];
    }
    String.prototype.charsArray = chars;
    return chars;
  };

  String.prototype.isCHS = function(i) {
    return (this.charCodeAt(i) > 255 || this.charCodeAt(i) < 0);
  };

  String.prototype.subCHString = function(start, end) {
    var len = 0,
      str = '',
      offset;
    this.strToChars();
    for (var i = 0, tmp = this.length; i < tmp; i++) {
      offset = (this.charsArray[i][1]) ? 2 : 1;
      len += offset;

      if (end < len) {
        return str;
      } else if (start < len) {
        str += this.charsArray[i][0];
      }
    }
    return str;
  };
};
