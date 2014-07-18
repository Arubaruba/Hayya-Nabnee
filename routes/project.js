var mongo = require('mongodb');
var url = require('url');
var async = require('async');
var dateTools = require('./tools/date');
var mongoTools = require('./tools/mongo');
var projectTools = require('./tools/project');
var discussionTools = require('./tools/discussion');

var missingProject = function(s) {
  var errors = s.strings('errors.json');
  s.response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  s.response.end(s.renderText('g/error.html', {
    errorMessage: errors.projectNotFound,
    errorInfo: s.dynamicRoutes[0]
  }));
}

exports.page = function(s) {

  async.waterfall([

      function(callback) {
        projectTools.getSingleProject(s, s.dynamicRoutes[0], callback);
      },
      function(project, callback) {
        if (project) {
          discussionTools.render(s, project.discussionId, function(err, discussion){
            if(err) throw(err);
            callback(null, project, discussion);
          });
        } else {
          missingProject(s);
        }
      }
    ],
    function(err, project, discussion) {
      var strings = s.strings('project.json');
      s.render('g/project.html', {
        project: project,
        discussion: discussion,
        getDate: function(date) {
          return new Date(date);
        },
        descriptiveDate: function(date) {
          return dateTools.descriptiveDate(s, null, new Date(date), {
            present: strings.begins,
            past: strings.started
          }, true);
        },
      });
    });
}

exports.volunteer = function(s) {

  var projectIdString = s.dynamicRoutes[0];

  var strings = s.strings('project.json');

  var projects = s.db.collection('projects');
  var projectId = null;

  try {
    projectId = mongo.ObjectID(projectIdString);
  } catch (err) {
    s.redirect('');
  }

  if (projectId) {
    s.db.collection('projects').find({
      _id: projectId,
      volunteers: {
        $elemMatch: {
          _id: s.account._id
        }
      }
    }).toArray(function(err, results) {
      if (results && results.length > 0) {
        s.encodedResponse({
          success: true
        });
      } else {
        s.db.collection('projects').update({
          _id: projectId
        }, {
          $push: {
            volunteers: {
              _id: s.account._id,
              joined: new Date()
            }
          }
        }, {
          multi: false,
          upsert: true
        }, function(err, result) {
          s.encodedResponse({
            success: true
          });
        });
      }
    });
  }
}

exports.leave = function(s) {

  var projectIdString = s.dynamicRoutes[0];

  var strings = s.strings('project.json');

  var projectId = null;

  try {
    projectId = mongo.ObjectID(projectIdString);
  } catch (err) {
    s.redirect('');
  }

  if (projectId) {
    s.db.collection('projects').find({
      volunteers: {
        $elemMatch: {
          _id: s.account._id
        }
      }
    }).toArray(function(err, results) {
      if (results && results.length > 0) {
        s.db.collection('projects').update({
          _id: projectId
        }, {
          $pull: {
            volunteers: {
              _id: s.account._id
            }
          }
        }, {
          multi: true
        }, function(err, result) {
          s.redirect('');
        });
      } else {
        s.redirect('');
      }
    });
  }
}

exports.missingProject = missingProject;
