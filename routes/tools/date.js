var daysBetween = function(firstDate, secondDate) {

  firstDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
  secondDate = new Date(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());

  var millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.floor((secondDate - firstDate) / millisecondsPerDay);
}

exports.descriptiveDate = function(s, firstDate, secondDate, verbs, fractionsOfADay) {

  var now = new Date();
  now.setUTCHours(now.getHours());
  firstDate = (!firstDate) ? now : firstDate;
  secondDate = (!secondDate) ? now : secondDate;

  var strings = s.strings('date_tools.json');

  var seconds = (secondDate - firstDate)/1000;
  var days = daysBetween(firstDate, secondDate);
  var template = (seconds > 0) ? 'l/upcoming_date.html' : 'l/past_date.html';
  var verbForm = (seconds > 0) ? 'present' : 'past';

  var descriptor = '';
  days = Math.abs(days);
  seconds = Math.abs(seconds);

  if(days >= 364){
      descriptor = 'year';
      value = days / 364;
  }else if(days >= 30){
      descriptor = 'month';
      value = days / 30;
  }else if(days >= 7){
      descriptor = 'week';
      value = days / 7;
  }else if(days >= 1 || !fractionsOfADay){
    value = days;
    descriptor = 'day';
    if(Math.floor(value) == 0){
      return s.renderText('l/current_date.html', {verb: verbs['present']});
    }
  }else if(seconds / 60 / 60 >= 1){
    descriptor = 'hour';
    value = seconds / 60 / 60;
  }else {
    descriptor = 'minute';
    value = seconds / 60;
  }
  value = Math.floor(value);

  var wordForm = (value > 1 || value == 0) ? 'plural' : 'singular';

  return s.renderText(template,{value: value, descriptor: strings[descriptor][wordForm],verb: verbs[verbForm]});
}

exports.daysBetween = daysBetween;
