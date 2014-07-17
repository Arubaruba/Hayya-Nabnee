var Swig = require('swig').Swig;
var fs = require('fs');

var config = require('../../config');
var util = require('../util');

var strings = {};
var templates = {};

var init = function() {

  //Load Strings
  util.scanDirRecursively(config.dir + '/' + config.paths.strings, config.mimeTypes.string, function(dir, file, extension) {
    var path = dir + file + '.' + extension;
    strings[path] = require(path);
  });

  //Load Templates
  for (var i = 0; i < config.locales.length; i++) {

    var locale = config.locales[i];
    templates[locale] = {};

    var templateDir = config.dir + '/templates/';

    util.scanDirRecursively(templateDir, config.mimeTypes.template, function(dir, file, extension) {

      var globalTemplatePath = config.dir + '/templates/global/';
      var localTemplatePath = config.dir + '/templates/local/' + locale + '/';
      var localStringPath = config.dir + '/strings/' + locale + '/';

      var path = abbreviatePath(dir + file + '.' + extension);

      function abbreviatePath(path) {
        var p = path.replace(globalTemplatePath, 'g/').replace(localTemplatePath, 'l/');
        return (p == path) ? null : p;
      }

      function unabbreviatePath(path) {
        var pathType = path.substring(0, 1);
        var pathFile = path.substring(2, path.length);
        switch (pathType) {
          case 'g':
            return globalTemplatePath + pathFile;
          case 'l':
            return localTemplatePath + pathFile;
          default:
            return path;
        }
      }

      if (path) {
        var swig = new Swig({
          loader: {
            load: function(path) {
              return fs.readFileSync(path, 'utf8');
            },
            resolve: unabbreviatePath
          }
        });

        swig.setTag('strings', function(str, line, parser, types, options) {
          return true;
        }, function(compiler, args, content, parents, options) {
          var js = 'if(!_ctx.l) _ctx.l = {};';
          for (var a = 0; a < args.length; a++) {
            var stringList = strings[localStringPath + args[a].replace(/\'/g, '')];
            for (s in stringList) {
              js += '_ctx.l.' + s + ' = \'' + stringList[s] + '\';';
            }
          }
          return js;
        }, false, false);
        templates[locale][path] = swig.compileFile(path);
      }
    });
  }
}

init();

exports.render = function(s, path, vars, allowMissing) {

  if(templates[s.locale]){
    var template = templates[s.locale][path];

    if (template) {
      if (!vars) vars = {};
      vars.s = s;
      return template(vars);
    } else if (allowMissing == true) {
      return null;
    } else {
      throw ('"' + path + '" Template not valid');
    }
  }
}

exports.stringsFunc = function(s) {
  var localStringPath = config.dir + '/strings/' + s.locale + '/';
  return function(path) {
    return strings[localStringPath + path];
  }
}
