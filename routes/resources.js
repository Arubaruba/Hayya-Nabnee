var fs = require('fs');
var url = require('url');
var mime = require('mime');
var path = require('path');

exports.css = function(s) {

  var pathname = url.parse(s.request.url).pathname;
  var path = 'g' + pathname + '.css';

  var locale = s.strings('locale.json');
  var errors = s.strings('errors.json');
  var content = s.renderText(path, locale, true);

  if (content == null) {
    s.response.writeHead(404, {
      'Content-Type': 'text/html'
    });
    s.response.end(s.renderText('g/error.html', {
      errorMessage: errors.stylesheetMissing,
      errorInfo: pathname
    }));
  } else {
    s.response.writeHead(200, {
      'Content-Type': 'text/css'
    });
    s.response.end(content);
  }
}

exports.js = function(s) {

  var pathname = url.parse(s.request.url).pathname;
  var path = 'g' + pathname + '.js';

  var errors = s.strings('errors.json');
  var content = s.renderText(path, {}, true);

  if (content == null) {
    s.response.writeHead(404, {
      'Content-Type': 'text/html'
    });
    s.response.end(s.renderText('g/error.html', {
      errorMessage: errors.scriptMissing,
      errorInfo: pathname
    }));
  } else {
    s.response.writeHead(200, {
      'Content-Type': 'application/javascript'
    });
    s.response.end(content);
  }
};

exports.static = function(s) {

  var pathname = url.parse(s.request.url).pathname;
  var fileDir = path.resolve(__dirname , '..' , pathname.substring(1));

  fs.stat(fileDir, function(err, stat) {

    if (err) {
      var errors = s.strings('errors.json');
      s.response.writeHead(404, {
        'Content-Type': 'text/html'
      });
      s.response.end(s.renderText('g/error.html', {
        errorMessage: errors.staticFileMissing,
        errorInfo: pathname
      }, false));
    } else {

      var stream = fs.createReadStream(fileDir);

      stream.on('open', function() {
        s.response.writeHead(200, {
          'Cache-Control': 'public, max-age=9000000',
          'Content-Length': stat.size,
          'Content-Type': mime.lookup(fileDir)
        });
      });

      stream.on('data', function(data) {
        s.response.write(data, null);
      });

      stream.on('error', function(err) {
        console.log(err);
        var errors = s.strings('errors.json');
        s.response.end(errors.streamingError);
      });

      stream.on('end', function(data) {
        s.response.end();
      });
    }
  });
}
