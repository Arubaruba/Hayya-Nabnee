var async = require('async');

var fields = [{
  id: 'emailaddress',
  label: 'emailAddress',
  type: 'email'
}, {
  id: 'password',
  label: 'password',
  type: 'password'
}]

exports.page = function(s) {
  s.render('g/sign_in.html', {
    fields: fields
  });
}

exports.query = function(s) {

  var accounts = s.db.collection('accounts');
  var errors = s.strings('errors.json');

  var fieldCorrections = {
    emailaddress: [{
      condition: true,
      message: 'input too short'
    }]
  };

  async.waterfall([

    function(callback) {
      accounts.find({
        email: s.get.emailaddress
      }).toArray(function(err, results) {
        if (err) {
          s.encodedResponse({
            error: errors.unknownError
          });
        } else if (results.length != 1) {
          s.encodedResponse({
            error: errors.invalidCredentials
          });
        } else {
          callback(null, results[0]);
        }
      });
    },
    function(account, callback) {
      s.crypto.verify(account.password.salt, account.password.hash, s.get.password, function(err, valid) {
        if (valid) {
          callback(null);
        } else {
          s.encodedResponse({
            error: errors.invalidCredentials
          });
        }
      });
    }
  ], function() {
    s.crypto.randomString(function(string) {

      var expires = new Date();
      expires.setMinutes(expires.getMinutes() + s.config.sessionDurationMinutes);
      
      accounts.update({
        email: s.get.emailaddress
      }, {
        $push: {
          'tokens': {
            type: 'session',
            value: string,
            expires: expires
          }
        }
      }, function(err, results) {}, {
        upsert: true
      });
      s.setCookie('session', string,{path:'/'});
      s.removeCookie('previous_page', {path:'/'});
        //.indexOf is used to check if the string starts with something
      if (s.cookies.previous_page && !s.cookies.previous_page.indexOf('/sign_in') != 0) {
        s.redirect(s.cookies.previous_page);
      } else {
        s.redirect('/');
      }
    });
  });
}
