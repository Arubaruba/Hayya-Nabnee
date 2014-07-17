var initialContentHeight = null;
var listContentExhaused = false;
var preventListQuery = false;

{% strings 'errors.json' %}

$(window).scroll(function() {
  if (!initialContentHeight) initialContentHeight = $('.content').height();
  if (window.pageYOffset > $('.content').height() - initialContentHeight / 2) {

    var oldChildLength = $('#window-list').children().length;

    if (!preventListQuery && !listContentExhaused) {
      $('#list_exhaused').hide();
      getResponse('/load_projects', {
        loaded: $('#window-list').children().length
      }, function(response) {
        preventListQuery = false;
        if (response.projects) {
          $('#window-list').append(response.projects);
          if ($('#window-list').children().length == oldChildLength) {
            listContentExhaused = true;
            $('#list_exhausted').show();
          }
        }
      }, function() {
        preventListQuery = false;
        showGeneralResponse('{{l.unableToConnect}}', true);
        preventListQuery = true;
        setTimeout(function() {
          preventListQuery = false;
          generalResponse.hide();
        }, 3000);
      });
    }
    preventListQuery = true;
  }
});
