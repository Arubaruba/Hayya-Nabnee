var async = require('async');
var dateTools = require('./tools/date.js');
var mongoTools = require('./tools/mongo.js');
var projectTools = require('./tools/project.js');

function getProjects(s, skip, limit, callback) {

  var minStartingDate = new Date();
  minStartingDate.setDate(minStartingDate.getDate() - s.config.daysToDisplayStartedProjects);

  projectTools.getProjects(s, [{
      $match: {
        $or: [{
          $and: [{
            completed: {
              $ne: true
            }
          }, {
            $or: [{
              volunteers: {
                $elemMatch: {
                  _id: s.account._id
                }
              }
            }, {
              community: s.account._id
            }]
          }]
        }, {
          startingDate: {
            $gt: minStartingDate
          }
        }]
      }
    }, {
      $skip: skip,
    }, {
      $limit: limit,
    }, {
      $sort: {
        startingDate: 1
      }
    }, ],
    function(err, results) {
      var strings = s.strings('project.json');
      var projectList = s.renderText('g/project_list.html', {
        projects: results,
        getDate: function(date) {
          return new Date(date);
        },
        descriptiveDate: function(date) {
          return dateTools.descriptiveDate(s, new Date(), new Date(date), {
            present: strings.begins,
            past: strings.started
          });
        }
      });
      callback(projectList);
    });
}

exports.loadProjects = function(s) {
  var startingAt = parseInt(s.get.loaded);
  if (!startingAt) statingAt = 0;
  getProjects(s, startingAt, s.config.projectListChunkSize, function(projects) {
    s.encodedResponse({
      projects: projects
    });
  });
}

exports.page = function(s) {
  getProjects(s, 0, s.config.projectListChunkSize, function(projects) {
    s.render('g/index.html', {
      projects: projects
    });
  });
}
