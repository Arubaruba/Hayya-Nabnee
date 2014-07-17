var mongoTools = require('./tools/mongo.js');
var async = require('async');
var missingProject = require('./project').missingProject;

exports.page = function(s) {

  async.waterfall([

    function(callback) {
      var projectId = mongoTools.parseId(s.dynamicRoutes[0]);
      if (projectId) callback(null, projectId);
      else missingProject(s);
    },
    function(projectId, callback) {
      s.db.collection('projects').find({
        _id: projectId
      }, {
        title: 1,
        volunteers: 1,
        verifiedAttendence: 1
      }).toArray(function(err, results) {
        if (results.length == 1) {
          callback(null, results[0]);
        } else {
          missingProject(s);
        }
      });
    },
    function(project, callback) {
      var volunteers = [];
      for (var i = 0; i < project.volunteers.length; i++) {
        volunteers.push(project.volunteers[i]._id);
      }
      s.db.collection('accounts').find({
        _id: {
          $in: volunteers
        }
      }, {
        fullName: 1,
      }).toArray(function(err, results) {
        for (var v = 0; v < project.volunteers.length; v++) {
          //Replace volunteer id's with volunteer objects from database
          for (var a = 0; a < results.length; a++) {
            if (project.volunteers[v]._id + '' == results[a]._id + '') {
              project.volunteers[v] = results[a];
              if(project.verifiedAttendence && project.verifiedAttendence.indexOf(project.volunteers[v]._id + '') > -1){
                project.volunteers[v].present = true;
              }
            }
          }
        }
        s.render('g/complete_project.html', {
          projectId: project._id + '',
          volunteers: project.volunteers
        });
      });
    },
  ]);
}

exports.submitReport = function(s) {

  function error() {
    var errors = s.strings('errors.json');
    s.encodedResponse({
      error: errors.unknownError
    });
  }

  async.waterfall([

    function(callback) {
      var projectId = mongoTools.parseId(s.get.projectId);
      if (projectId) callback(null, projectId);
      else error();
    },
    function(projectId, callback) {
      s.db.collection('projects').update({
        _id: projectId,
        community: s.account._id
      }, {
        $set: {
          complete: true,
          verifiedAttendence: s.get.volunteers
        }
      }, function(err, resultCount) {
        if (resultCount > 0) {
          s.redirect('/');
        } else {
          error();
        }
      });
    }
  ]);
}
