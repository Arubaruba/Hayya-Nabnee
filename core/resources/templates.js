var Swig = require('swig').Swig;
var fs = require('fs');
var path = require('path');

var config = require('../../config');
var util = require('../util');

var strings = {};
var templates = {};

var init = function() {

  //Load Strings
  util.scanDirRecursively(path.resolve(__dirname, '../../strings'), config.mimeTypes.string, function(dir, file, extension) {
    var filePath = path.resolve(dir, file + '.' + extension);
    strings[filePath] = require(filePath);
  });

  //Load Templates
  for (var i = 0; i < config.locales.length; i++) {

    var locale = config.locales[i];
    templates[locale] = {};

    var templateDir = path.resolve(__dirname, '../../templates');

    util.scanDirRecursively(templateDir, config.mimeTypes.template, function(dir, file, extension) {

      var globalTemplatePath = path.resolve(__dirname, '../../templates/global');
      var localTemplatePath = path.resolve(__dirname,  '../../templates/local', locale);
      var localStringPath = path.resolve(__dirname, '../../strings', locale);

      var unshortenedFilePath = path.resolve(dir, file + '.' + extension);
      var filePath = unshortenedFilePath
        .replace(globalTemplatePath, 'g')
        .replace(localTemplatePath, 'l');

      function unabbreviatePath(filePath) {
        var filePathType = filePath.substring(0, 1);
        var filePathFile = filePath.substring(2, filePath.length);
        switch (filePathType) {
          case 'g':
            return path.resolve(globalTemplatePath, filePathFile);
          case 'l':
            return path.resolve(localTemplatePath, filePathFile);
          default:
            return filePath;
        }
      }

      if (filePath != unshortenedFilePath) {
        var swig = new Swig({
          loader: {
            load: function(filePath) {
              return fs.readFileSync(filePath, 'utf8');
            },
            resolve: unabbreviatePath
          }
        });

        swig.setTag('strings', function(str, line, parser, types, options) {
          return true;
        }, function(compiler, args, content, parents, options) {
          var js = 'if(!_ctx.l) _ctx.l = {};';
          for (var a = 0; a < args.length; a++) {
            var stringList = strings[path.resolve(localStringPath, args[a].replace(/\'/g, ''))];
            for (s in stringList) {
              js += '_ctx.l.' + s + ' = \'' + stringList[s] + '\';';
            }
          }
          return js;
        }, false, false);
        templates[locale][filePath] = swig.compileFile(filePath);
      }
    });
  }
}

init();

exports.render = function(s, filePath, vars, allowMissing) {

  if(templates[s.locale]){
    var template = templates[s.locale][filePath];

    if (template) {
      if (!vars) vars = {};
      vars.s = s;
      return template(vars);
    } else if (allowMissing == true) {
      return null;
    } else {
      throw ('"' + filePath + '" Template not valid');
    }
  }
};

exports.stringsFunc = function(s) {
  var localStringPath = path.resolve(__dirname, '../../strings', s.locale);
  return function(filePath) {
    return strings[path.resolve(localStringPath, filePath)];
  }
};
