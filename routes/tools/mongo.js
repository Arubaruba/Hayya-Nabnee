var mongo = require('mongodb');

exports.join = function(rows, additions) {
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    for (field in row) {
      if (additions[field]) {
        var addition = additions[field];
        for(var a = 0; a < addition.length; a++){
          if (addition[a]._id + '' == row[field] + '') {
            row[field] = addition[a];
          }
        }
      }
    }
  }
}

exports.parseId = function(idString){

  //To prevent a dangerous bug where
  //a random id would be generated if this was null
  if(!idString) return null;


  var id;
  try {
    id = mongo.ObjectID(idString);
  } catch (err) {}

  return id;
}

exports.newId = function(){
  return mongo.ObjectID();
}
