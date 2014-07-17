exports.join = function(rows, additions) {
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    for (field in row) {
      if (additions[field]) {
        var addition = additions[field][0];
        if (addition._id + '' == row[field] + '') {
          row[field] = addition;
        }
      }
    }
  }
}

var daysBetween = function(firstDate, secondDate) {

  firstDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
  secondDate = new Date(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());

  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((secondDate - firstDate) / millisecondsPerDay);
}

exports.descriptiveDate = function(s, firstDate, secondDate, verbs) {

  var strings = s.strings('db_util.json');

  var days = daysBetween(firstDate, secondDate);
  var template = (days > 0) ? 'l/upcoming_date.html' : 'l/past_date.html';
  var verbForm = (days > 0) ? 'present' : 'past';

  var descriptor = '';
  days = Math.abs(days);

  if(days >= 364){
      descriptor = 'year';
      value = days / 364;
  }else if(days >= 30){
      descriptor = 'month';
      value = days / 30;
  }else if(days >= 7){
      descriptor = 'week';
      value = days / 7;
  }else if(days == 0){
      return s.renderText('l/current_date.html', {verb: verbs['present']});
  }else{
    descriptor = 'day';
    value = days;
  }

  var wordForm = (value > 1) ? 'plural' : 'singular';

  return s.renderText(template,{value: Math.floor(value), descriptor: strings[descriptor][wordForm],verb: verbs[verbForm]});
}

exports.daysBetween = daysBetween;
