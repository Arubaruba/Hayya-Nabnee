var formTools = require('./tools/form');

var fields = [{
  id: 'fullname',
  label: 'fullName',
  type: 'textfield'
}, {
  id: 'emailaddress',
  label: 'emailAddress',
  type: 'email'
}, {
  id: 'password',
  label: 'password',
  firstLabel: 'password',
  secondLabel: 'repeatPassword',
  input: 'confirmed'
}, {
  id: 'phonenumber',
  label: 'phoneNumber',
  type: 'textfield',
  optional: true,
}]

exports.page = function(s) {
  if (s.get.community_account_link) {
    s.setCookie('community_account_link', s.get.community_account_link, {
      expires: s.config.cookie.distantExpiryDate
    });
  } else {
    s.removeCookie('community_account_link');
  }
  s.render('g/sign_up.html', {
    fields: fields
  });
}

exports.query = function(s) {

  var accounts = s.db.collection('accounts');
  var errors = s.strings('errors.json');

  accounts.find({
    email: s.get.emailaddress
  }).toArray(function(err, results) {
    var fieldCorrections = {
      emailaddress: [{
        condition: results.length != 0,
        message: errors.emailTaken,
      }],
    };
    formTools.corrections(s, fields, fieldCorrections, function() {
      s.crypto.secureHash(s.get.password[0], function(err, hash, salt) {

        function createAccount(accountType) {
          var accountInformation = {
            type: accountType,
            fullName: s.get.fullname,
            email: s.get.emailaddress,
            password: {
              hash: hash,
              salt: salt
            },
            created: new Date(),
          }
          for (accountDefault in s.config.accountDefaults) {
            accountInformation[accountDefault] = s.config.accountDefaults[accountDefault];
          }
          if (s.get.phonenumber != '') accountInformation.phoneNumber = s.get.phonenumber;
          accounts.insert(accountInformation, function(err, results) {
            if (err) {
              s.encodedResponse({
                error: errors.unknownError
              });
            } else {
              s.redirect('/sign_in');
            }
          });
        }

        if (s.cookies.community_account_link) {

          accounts.find({
            tokens: {
              $elemMatch: {
                type: 'create_privileged_account',
                value: s.cookies.community_account_link
              }
            }
          }, {
            'tokens.$': 1,
            '_id': 1
          }).toArray(function(err, results) {
            if (results.length > 0 && results[0].tokens.length > 0) {
              var token = results[0].tokens[0];
              accounts.update({}, {
                $pull: {
                  tokens: {
                    type: 'create_privileged_account',
                    email: token.email,
                  }
                }
              }, {
                upsert: false,
                multi: true
              }, function(err, results) {});
              createAccount(token.accountType);
            } else {
              s.redirect('/error/expired_link', {
                requestedURL: '/sign_up?community_account_link=' + s.cookies.community_account_link
              });
            }
          });
        } else {
          createAccount('volunteer');
        }
      });
    });
  });
}
