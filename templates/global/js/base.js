{% strings 'errors.json' %}

function getResponse(url, parameters, callback, errorCallback) {
  var separator = (url.indexOf('?') != -1) ? '&' : '?';
  var parameterString = (parameters) ? '&' + $.param(parameters) : '';
  return $.get(url + separator +'ajax' + parameterString, function(data) {
    var response = JSON.parse(data);
    var redirect = response.redirect;
    //It can == '' which is falsy
    if (redirect != null) {
      window.location = redirect;
    } else {
      callback(response);
    }
  }).error(function() {
    if(errorCallback) errorCallback();
    else showGeneralResponse('{{l.unableToConnect}}', true);
  });
}

function focus(target){
  target = target.first();
  target.focus();
  //To get the cursor to move to the end
  //of the inputted text
  var v = target.val();
  target.val('');
  target.val(v);
}

function setCookie(cookie, value, expiry){
  document.cookie = escape(cookie)+'='+escape(value)+';expires='+expiry+';path=/;' + document.cookie;
}

function removeCookie(cookie){
  setCookie(cookie,'','expires={{config.cookie.pastDate}}');
}

function returnWhenSignedIn(){
  setCookie('previous_page', window.location.pathname);
  window.location = '/sign_in';
}

function endSession(){
  removeCookie('session');
  window.location = '';
}

var responseCount = 0;

function showGeneralResponse(message, error) {
  var generalResponse = $('#general_response');
  generalResponse.hide();

  if (error) {
    generalResponse.attr('error', true);
  } else {
    generalResponse.attr('error', null);
  }
  generalResponse.html(message);
  generalResponse.show();
  generalResponse.focus();
  responseCount++;
  var currentResponseCount = responseCount;
  setTimeout(function(){
    if(currentResponseCount == responseCount){
      generalResponse.hide();
    }
  }, 5000);
}
