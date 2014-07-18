var mongoTools = require('./mongo');
var dateTools = require('./date');
var async = require('async');
var config = require('../../config');
var database = require('../../core/resources/database');
var templates = require('../../core/resources/templates');

exports.render = function(s, discussionId, callback) {
  async.waterfall([

    function(callback) {
      s.db.collection('messages').aggregate([{
        $match: {
          discussion: discussionId
        }
      }, {
        $project: {
          _id: 1,
          replyTo: 1
        }
      }], callback);
    },
    function(results, callback) {

      var loadThese = [];

      function scanForRepliesRecusively(messageId, skip, limit) {
        var messagesFound = 0;
        for (var i = 0; i < results.length; i++) {
          if (results[i].replyTo + '' == messageId + '') {
            messagesFound++;
            if (messagesFound > skip) {
              loadThese.push(results[i]._id);
              scanForRepliesRecusively(results[i]._id, 0, s.config.messageListReplyChunkSize);
              //if (messagesFound == skip + limit) break;
            }
          }
        }
      }

      scanForRepliesRecusively('', 0, s.config.messageListChunkSize);

      callback(null, loadThese);
    },
    function(loadThese, callback) {
      async.parallel({
        messages: function(callback) {
          s.db.collection('messages').aggregate([{
            $match: {
              _id: {
                $in: loadThese
              }
            }
          }, {
            $sort: {
              posted: -1
            }
          }], callback);
        },
        accounts: function(callback) {
          s.db.collection('accounts').find({}, {
            _id: 1,
            fullName: 1
          }).toArray(callback);
        }
      }, function(err, results) {
        mongoTools.join(results.messages, {
          author: results.accounts
        });
        callback(null, results.messages);
      });
    }
  ], function(err, messages) {
    if (!err) {
      var html = s.renderText('g/tools/discussion_frame.html', {
        messages: messages,
        discussionId: discussionId,
        descriptiveDate: function (date) {
          return dateTools.descriptiveDate(s, new Date(), new Date(date), {}, true);
        }
      });
      callback(null, html);
    } else {
      throw (err);
    }
  });
}

exports.init = function(io) {

    io.sockets.on('connection', function (socket) {

        var db = database.getDb();

        function makeSession(data) {
            var s = {
                locale: data.locale
            }

            s.renderText = function (path, vars, ignoreMissing) {
                return templates.render(s, path, vars, ignoreMissing);
            }
            s.strings = templates.stringsFunc(s);
            return s;
        }

        if (db) {

            socket.on('join', function (data) {
                socket.join(data);
            });

            socket.on('post_message', function (data) {

                var discussionId = mongoTools.parseId(data.discussionId);
                var replyToId = (data.replyTo) ? mongoTools.parseId(data.replyTo) : '';
                var authorId = mongoTools.parseId(data.accountId);

                if (discussionId && replyToId != null && authorId) {

                    var s = makeSession(data);

                    var discussionStrings = s.strings('discussion.json');

                    db.collection('messages').insert({
                        author: authorId,
                        discussion: discussionId,
                        body: data.body,
                        replyTo: replyToId,
                        posted: new Date()
                    }, function (err, messageResults) {
                        db.collection('accounts').find({
                            _id: authorId
                        }, {
                            fullName: 1
                        }).toArray(function (err, accountResults) {
                            if (accountResults[0]) {
                                mongoTools.join(messageResults, {
                                    author: accountResults
                                });
                                io.to(data.discussionId).emit('load_message', {
                                    messageHTML: s.renderText('g/tools/discussion_message.html', {
                                        message: messageResults[0],
                                        descriptiveDate: function (date) {
                                            return dateTools.descriptiveDate(s, new Date(), new Date(date), {}, true);
                                        }
                                    }),
                                    replyTo: data.replyTo
                                });
                            }
                        });
                    });
                }
            });
        } else {
            console.log('socket needs to be connected to database');
        }
    });
}