exports.error401 = function(s) {
  var errors = s.strings('errors.json');
  s.render('g/error.html', {
    errorMessage: errors.accessDenied,
    errorInfo: s.get.requestedURL
  });
}

exports.error404 = function(s) {
  var errors = s.strings('errors.json');
  s.render('g/error.html', {
    errorMessage: errors.invalidURL,
    errorInfo: s.get.requestedURL
  });
}

exports.expiredLink = function(s) {
  var errors = s.strings('errors.json');
  s.render('g/error.html', {
    errorMessage: errors.expiredLink,
    errorInfo: s.get.requestedURL
  });
}
