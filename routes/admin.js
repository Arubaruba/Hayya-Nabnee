var formTools = require('./tools/form');

var communityAccountFields = [{
  id: 'communityemailaddress',
  label: 'communityEmailAddress',
  type: 'email'
}]

exports.page = function(s) {
  s.render('g/admin.html', {
    fields: communityAccountFields
  });
}

exports.sendCommunityLink = function(s) {

  var strings = s.strings('admin.json');
  var accounts = s.db.collection('accounts');

  s.crypto.randomString(function(link) {

    s.mailer(s, s.get.communityemailaddress, strings.communityLink,
      s.renderText('g/emails/community_account_link.html', {
        link: s.config.url + '/sign_up?community_account_link=' + link
      }), function(err, info) {
        var fieldCorrections = {
          communityemailaddress: [{
            condition: err != null,
            message: strings.invalidEmail,
          }],
        }
        formTools.corrections(s, communityAccountFields, fieldCorrections, function() {
          s.encodedResponse({
            message: strings.linkSent
          });
        });
        if (!err && s.account) {
          accounts.update({
            _id: s.account._id
          }, {
            $push: {
              'tokens': {
                type: 'create_privileged_account',
                value: link,
                accountType: 'community',
                email: s.get.communityemailaddress,
                expires: new Date().valueOf() + s.config.accountCreationLinkDurationDays * 86400000
              }
            }
          }, function() {}, {
            upsert: true
          });
        }
      });
  });
}
