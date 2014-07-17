var querystring = require('querystring');
var url = require('url');

var config = require('../../config.json');

function appendHeader(s, name, value){
  var header = [];
  if(s.response.getHeader(name)){
    header = s.response.getHeader(name);
  }
  header.push(value);
  s.response.setHeader(name, header);
}

var setCookieFunc = function(s) {
  return function(name, value, att) {
    var attributes = '';
    for (a in att) {
      attributes += a + '=' + att[a] + ';';
    }
    appendHeader(s, 'Set-Cookie', encodeURI(name) + '=' + encodeURI(value) + ';' + attributes);
  }
}

exports.removeCookieFunc = function(s) {
  return function(name, args) {
    if(!args) args = {};
    args.expires= config.cookie.pastDate
    setCookieFunc(s)(name, '',args);
  }
}

exports.getCookies = function(request) {
  if(!request.headers.cookie) return {};
  return querystring.parse(request.headers.cookie.replace(/ /g,''), ';');
}

exports.getGETVars = function(request) {
  var items = querystring.parse(url.parse(request.url).query);
  for (item in items) {
    if (item.substring(item.length - 2) == '[]') {
      var value = items[item];
      if (typeof(value) == 'string') value = [value];
      items[item.substring(0, item.length - 2)] = value;
      delete(items[item]);
    }
  }
  return items;
}

exports.getLocale = function(s) {
  //Start with the Default Locale
  var locale = config.locales[0];

  function setLocaleIfValid(value) {
    var valid = config.locales.indexOf(value) != -1;
    if (valid) {
      locale = value;
    }
    return valid;
  }
  if (s.get.locale) {
    var valid = setLocaleIfValid(s.get.locale);
    if (valid) setCookieFunc(s)('locale', s.get.locale, {
      expires: config.cookie.distantExpiryDate
    });
  } else {
    setLocaleIfValid(s.cookies.locale);
  }
  return locale;
}

exports.encodedResponseFunc = function(s) {
  return function(vars) {
    s.response.end(JSON.stringify(vars));
  }
}

exports.redirectFunc = function(s) {
  return function(path, inputs) {

    if (inputs) {
      path = path + '?' + querystring.stringify(inputs);
    }

    if (s.get.ajax != null) {
      s.encodedResponse({
        redirect: path
      });
    } else {
      s.response.statusCode = 302;
      s.response.setHeader('Location', path);
      s.response.end();
    }
  }
}

exports.errors = {
  error404: function(s) {
    s.response.writeHead(302, {
      Location: '/error/404?requestedURL=' + escape(s.request.url)
    });
    response.end();
  }
};

exports.setCookieFunc = setCookieFunc;
exports.appendHeader = appendHeader;
