exports.corrections = function(s, fields, corrections, success) {

  var errors = s.strings('errors.json');

  function addCorrection(fieldName, correction) {
    if (!corrections[fieldName]) corrections[fieldName] = [];
    corrections[fieldName].push(correction);
  }

  var errors = s.strings('errors.json');

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    var value = s.get[field.id];
    var emptyField = false;
    if (typeof(value) == 'string') {
      emptyField = !value;
    } else {
      for (var a = 0; a < value.length; a++) {
        if (!(value[a].length > 0)) emptyField = true;
      }
    }
    if (!field.optional && emptyField) {
      addCorrection(field.id, {
        condition: true,
        message: errors.emptyField
      });
    }
  }

  var unmetConditionFound = false;

  for (fieldName in corrections) {
    var fieldCorrections = corrections[fieldName];
    for (var i = 0; i < fieldCorrections.length; i++) {
      if (fieldCorrections[i].condition == true) {
        unmetConditionFound = true;
        break;
      }
    }
  }

  if (unmetConditionFound) {
    s.encodedResponse({
      corrections: corrections
    });
  } else {
    success();
  }
}
