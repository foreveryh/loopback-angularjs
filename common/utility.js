var exports = module.exports = {};
// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.countByteLength = function(str, cnCharByteLen) {
  var byteLen = 0;
  for (var i = 0; i < str.length; i++) {
      //alert（str.charAt（i））;
      if ((/[\x00-\xff]/g).test(str.charAt(i)))
          byteLen += 1;
      else
          byteLen += cnCharByteLen;
  }
  return byteLen;
}