var async = require('async');

var fields = [{
  id: 'emailaddress',
  label: 'emailAddress',
  type: 'email'
}];

exports.page = function(s) {
  s.render('g/forgot_password.html', {
    fields: fields
  });
};

exports.query = function(s) {

};
