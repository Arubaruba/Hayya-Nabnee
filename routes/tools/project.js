var mongoTools = require('./mongo.js');
var async = require('async');

exports.getSingleProject = function(s, projectIdString, callback) {

  var projectId = mongoTools.parseId(projectIdString);

  if (projectId) {
    projectQuery(s, [{
      $match: {
        _id: projectId
      }
    }], function(err, results) {
      if (results) {
        callback(err, results[0]);
      } else {
        callback(err);
      }
    });
  } else {
    callback('Invalid Project Id');
  }
}
var getProjects = function(s, aggregate, finalCallback) {
  projectQuery(s, aggregate, finalCallback);
}


var projectQuery = function(s, aggregate, finalCallback) {
  async.parallel({
    communities: function(callback) {
      s.db.collection('accounts').find({
        type: 'community'
      }, {
        fullName: 1,
        phoneNumber: 1,
        email: 1,
      }).toArray(function(err, results) {
        callback(err, results);
      });
    },
    projects: function(callback) {
      s.db.collection('projects').aggregate(aggregate, function(err, result) {
        callback(err, result);
      });
    },
  }, function(err, results) {
    if (results.projects && results.projects.length > 0) {
      mongoTools.join(results.projects, {
        community: results.communities
      });

      for (var i = 0; i < results.projects.length; i++) {
        var project = results.projects[i];
        for (var a = 0; a < project.volunteers.length; a++) {
          if (project.volunteers[a]._id + '' == s.account._id + '') {
            project.accountIsVolunteer = true;
            break;
          }
        }
      }
    }
    finalCallback(err, results.projects);
  });
}

exports.getProjects = getProjects;
