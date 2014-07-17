var databaseName = 'hayya_nabnee';
var config = require('../../config.json');
var mongo = require('mongodb');

var db = null;

function maintainance() {

  db.collection('accounts').update({}, {
    $pull: {
      tokens: {
        expires: {
          $lt: new Date()
        }
      }
    }
  },{multi:true}, function(err) {
    if(err) throw(err);
  });

  setTimeout(maintainance, 10000);
}


exports.init = function(callback) {

  mongo.MongoClient.connect('mongodb://127.0.0.1:27017/' + databaseName, {
    db: {
      native_parser: true
    }
  }, function(err, result) {
    if (err) throw (err);
    db = result;
    maintainance();
    callback();
  });
}

exports.getAccount = function(s, callback) {

  var session = s.cookies.session;

  var accounts = db.collection('accounts');
  accounts.find({
    tokens: {
      $elemMatch: {
        type: 'session',
        value: session
      }
    }
  }, {
    '_id': 1,
    type: 1,
  }).toArray(function(err, results) {
    if (err) {
      console.log(err);
      callback({});
    } else if (results.length == 1) {

      var expires = new Date();
      expires.setMinutes(expires.getMinutes() + s.config.sessionDurationMinutes);

      accounts.update({
        tokens: {
          $elemMatch: {
            value: session
          }
        }
      }, {
        $set: {
          "tokens.$.expires": expires
        }
      }, function(err) {
        if(err) throw(err);
      })
      callback(results[0]);
    } else {
      callback({});
    }
  });
}

exports.getDb = function() {
  return db;
};
