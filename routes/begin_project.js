var formTools = require('./tools/form');
var dateTools = require('./tools/date.js');
var mongoTools = require('./tools/mongo.js');

var fields = [{
  id: 'title',
  label: 'projectTitle',
  type: 'textfield'
}, {
  id: 'description',
  label: 'projectDescription',
  input: 'textarea'
}, {
  id: 'location',
  label: 'projectLocation',
  input: 'textarea'
}, {
  id: 'startingdate',
  label: 'begins',
  input: '_date'
}]

exports.page = function(s) {
  s.render('g/begin_project.html', {
    fields: fields
  });
}

exports.query = function(s) {

  var errors = s.strings('errors.json');
  var projects = s.db.collection('projects');

  var hour = s.get.startingdate[0];
  var minute = s.get.startingdate[1];
  var day = s.get.startingdate[2];
  var month = s.get.startingdate[3];
  var year = s.get.startingdate[4];

  var pastDate = (dateTools.daysBetween(new Date(year, month - 1, day), new Date()) > 0);
  var daysInMonth = new Date(year, month, 0).getDate();

  var fieldCorrections = {
    startingdate: [{
      condition: pastDate,
      message: errors.datePassed
    }, {
      condition: day > daysInMonth,
      message: errors.invalidDaysForMonth
    }]
  };

  var startingDate = new Date();

  startingDate.setUTCHours(hour);
  startingDate.setUTCMinutes(minute);
  startingDate.setUTCDate(day);
  startingDate.setUTCMonth(month - 1);
  startingDate.setUTCFullYear(year);

  formTools.corrections(s, fields, fieldCorrections, function() {

    projects.insert({
      community: s.account._id,
      title: s.get.title,
      description: s.get.description,
      location: s.get.location,
      startingDate: startingDate,
      volunteers:[],
      discussionId: mongoTools.newId()
    }, function() {});

    s.redirect('/');
  });
}
