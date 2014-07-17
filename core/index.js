var async = require('async');
var fs = require('fs');
var http = require('http');
var mongo = require('mongodb');
var url = require('url');
var https = require('https');

var log = require('./log');
var session = require('./session');
var util = require('./util');
var config = require('../config.json');
var database = require('./resources/database');
var routes = require('./resources/routes');
var discussion = require('../routes/tools/discussion');

var sslOptions = {
  pfx: fs.readFileSync(config.dir + '/server.p12'),
  passphrase:'Flastirst6142'
};

//Redirect http requests to https
http.createServer(function(request, response){
  response.statusCode = 302;
  response.setHeader('Location', config.url);
  response.end();
}).listen(config.ports.http);

var server = https.createServer(sslOptions, function(request, response) {

  var s = session(request, response, function(s) {

    var dirs = url.parse(request.url).pathname.split('/');
    var currentDir = routes;
    for (var i = 1, ii = dirs.length; i < ii; i++) {
      var dir;
      if (currentDir['$']) {
        dir = currentDir['$'];
        s.dynamicRoutes.push(dirs[i]);
      } else {
        dir = currentDir[dirs[i]];
      }
      if (dir) {
        if (dir.accountTypes && (!s.account || dir.accountTypes.indexOf(s.account.type) == -1)) {
          if(s.get.ajax == null){
            s.setCookie('previous_page', request.url, {
              path: '/'
            });
          }else{
            s.setCookie('previous_page', s.cookies.GET_source_page, {
              path: '/'
            });
          }
          s.redirect('/sign_in');
          break;
        }
        if (dir.script && (i == ii - 1 || dir.unconditionalExecution)) {
          dir.script(s);
          break;
        } else {
          if (dir.dirs) {
            currentDir = dir.dirs;
          } else {
            s.redirect('/error/404', {
              requestedURL: request.url
            });
            break;
          }
        }
      } else {
        s.redirect('/error/404', {
          requestedURL: request.url
        });
        break;
      }
    }
  });
});

//Make sure these async functions are done
async.parallel([database.init], function() {
  discussion.init(require('socket.io')(server));
  server.listen(config.ports.https);
  log('Server Initialized');
});
