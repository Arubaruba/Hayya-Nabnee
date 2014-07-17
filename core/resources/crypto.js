var crypto = require('easy-pbkdf2')();
var salt = crypto.generateSalt();

//This function is not directly passed so that it can use a global salt object
exports.secureHash = function(text, callback) {
  crypto.secureHash(text, salt, function(err, hash, uniqueSalt) {
    callback(err, hash, uniqueSalt);
  });
}

exports.verify = crypto.verify;
exports.randomString = function(callback){
  crypto.generateSalt(1024, function(string){
    callback(string.substring(4, string.length - 1).replace(/[^a-zA-Z0-9_]/g,''));
  });
}
