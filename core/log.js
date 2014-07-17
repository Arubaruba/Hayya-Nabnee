var fs = require('fs');
var config = require('../config.json');

module.exports = function(message, location) {
  var date = new Date();
  console.log('[' + date.toLocaleDateString() + '  ' + date.toLocaleTimeString() + ':' + date.getMilliseconds() + '] ' + message);
}
