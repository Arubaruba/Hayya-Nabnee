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
  label: 'startingDate',
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

  var day = s.get.startingdate[0];
  var month = s.get.startingdate[1];
  var year = s.get.startingdate[2];

  var pastDate = (dateTools.daysBetween(new Date(year, month - 1, day), new Date()) > 0);

  var fieldCorrections = {
    startingdate: [{
      condition: pastDate,
      message: errors.datePassed
    }],
  };

  var startingDate = new Date();
  startingDate.setDate(day);
  startingDate.setMonth(month - 1);
  startingDate.setFullYear(year);

  formTools.corrections(s, fields, fieldCorrections, function() {

    projects.insert({
      community: s.account._id,
      title: s.get.title,
      description: s.get.description,
      location: s.get.location,
      startingDate: startingDate,
      volunteers:[],
      discussionId: mongoTools.newId(),
    }, function() {});

    s.redirect('/');
  });
}
