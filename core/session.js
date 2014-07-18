var log = require('./log');
var swig = require('swig');
var config = require('../config.json');

var templates = require('./resources/templates');
var headerUtil = require('./resources/headerUtil');
var database = require('./resources/database');
var crypto = require('./resources/crypto');
var mailer = require('./resources/mailer');

module.exports = function(request, response, callback) {

  //Session
  var s = {
    request: request,
    response: response,
    db: database.getDb(),
    cookies: headerUtil.getCookies(request),
    get: headerUtil.getGETVars(request),
    crypto: crypto,
    config: config,
    mailer: mailer,
    url: request.url,
    now: new Date(),
    dynamicRoutes: []
  }

  //These have to come later because they require the Session Var
  s.locale = headerUtil.getLocale(s);
  s.strings = templates.stringsFunc(s); //returns function
  s.encodedResponse = headerUtil.encodedResponseFunc(s); //returns function
  s.redirect = headerUtil.redirectFunc(s); //returns function
  s.setCookie = headerUtil.setCookieFunc(s); //returns function
  s.removeCookie = headerUtil.removeCookieFunc(s); //returns function

  s.render = function(path, vars, ignoreMissing) {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html');
    response.end(templates.render(s, path, vars, ignoreMissing));
  }

  s.renderText = function(path, vars, ignoreMissing) {
    return templates.render(s, path, vars, ignoreMissing);
  }

  database.getAccount(s, function(account) {
    s.account = account;
    callback(s);
  });
}
