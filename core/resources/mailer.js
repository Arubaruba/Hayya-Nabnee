var nodemailer = require('nodemailer');
var config = require('../../config.json');

var transport = nodemailer.createTransport('SMTP', {
  host: 'localhost'
});

module.exports = function(s, recipient, subject, content, callback) {
  var strings = s.strings('layout.json');
  transport.sendMail({
    from: strings.websiteName + ' <' + config.mailingAddress + '>',
    to: recipient,
    subject: subject,
    html: content
  }, function(err, result) {
    callback(err, result);
  });
}
