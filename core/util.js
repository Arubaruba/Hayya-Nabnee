var fs = require('fs');
var mime = require('mime');

var scanDirRecursively = function(dir, permittedExtensions, handleFile) {
  scanDir(dir, permittedExtensions, handleFile, function(path) {
    scanDirRecursively(path, permittedExtensions, handleFile);
  });
}

var scanDir = function(dir, permittedExtensions, handleFile, handleDir) {
  var dirContents = fs.readdirSync(dir);
  for (var i = 0, ii = dirContents.length; i < ii; i++) {
    var path = dir + dirContents[i];
    var stat = fs.statSync(path);
    if (stat.isDirectory()) {
      if (handleDir) handleDir(path + '/');
    } else {
      var nameParts = dirContents[i].split('.');
      //Take away the last part of the Array, the extension
      var extension = nameParts.pop();
      //Reassemble the name; Reinserting periods that were removed
      var name = nameParts.join('.');
      if (permittedExtensions == false || permittedExtensions.indexOf(mime.lookup(extension)) != -1) {
        handleFile(dir, name, extension);
      }
    }
  }
}

exports.scanDir = scanDir;
exports.scanDirRecursively = scanDirRecursively;
