var projectTools = require('./tools/project');
var mongoTools = require('./tools/mongo');
var dateTools = require('./tools/date');
var async = require('async');

var missingProfile = function(s) {
  var errors = s.strings('errors.json');
  s.response.writeHead(404, {
    'Content-Type': 'text/html'
  });
  s.response.end(s.renderText('g/error.html', {
    errorMessage: errors.profileNotFound,
    errorInfo: s.request.url
  }));
}

exports.handleAccountType = function(s) {

  var accountId = mongoTools.parseId(s.dynamicRoutes[0]);

  if (accountId) {
    s.db.collection('accounts').find({
      _id: accountId
    }).toArray(function(err, results) {
      if (err) throw (err);
      if (results && results.length > 0) {
        communityProfile(s, results[0]);
      } else {
        missingProfile(s);
      }
    });
  } else {
    missingProfile(s);
  }
}

var communityProfile = function(s, community) {

  async.parallel({

    recentProjects: function(callback) {
      var minStartingDate = new Date();
      minStartingDate.setDate(minStartingDate.getDate() - s.config.daysToDisplayStartedProjects);

      projectTools.getProjects(s, [{
        $match: {
          community: community._id,
          completed: {
            $ne: true
          },
          startingDate: {
            $gt: minStartingDate
          }
        },
      }, {
        $limit: 5,
      }, {
        $sort: {
          startingDate: -1
        }
      }], callback);
    },
    completedProjects: function(callback) {
      projectTools.getProjects(s, [{
        $match: {
          community: community._id,
          complete: true
        },
      }, {
        $sort: {
          startingDate: -1
        }
      }], callback);
    },
  }, function(err, results) {
    var strings = s.strings('project.json');
    s.render('g/community_profile.html', {
      community: community,
      recentProjects: results.recentProjects,
      completedProjects: results.completedProjects,
      descriptiveDate: function(date) {
        return dateTools.descriptiveDate(s, new Date(), new Date(date), {
          present: strings.begins,
          past: strings.started,
        });
      },
    });
  });
}
