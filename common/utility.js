var exports = module.exports = {};
// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
exports.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};