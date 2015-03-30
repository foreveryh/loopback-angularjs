angular.module('Shu.utility', []);
angular.module('Shu.utility').run(function() {
  // js prototype 
});
angular.module('Shu.utility').factory('utility', function() {
  /**
   * isArray
   *
   * @param mixed input
   * @return bol
   */

  var private_is_array = function(obj) {
    if (obj.constructor.toString().indexOf('Array') == -1) {
      return false;
    }
    return true;
  };

  return {

    /**
     * stripTags
     *
     * @param mixed input
     * @return mixed output
     */

    strip_tags: function(input) {
      if (input) {
        var tags = /<(?:.|\n)*?>/gm;
        if (!private_is_array(input)) {
          input = input.replace(tags, "");
        } else {
          var i = input.length;
          var newInput = new Array();
          while (i--) {
            input[i] = input[i].replace(tags, "");
          }
        }
        return input;
      }
      return false;
    }
  };
});
