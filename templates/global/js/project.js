{% strings 'errors.json' %}

$(document).ready(function() {

  var joinProject = $('#join_project');
  var leaveProject = $('#leave_project');
  var agreeToRequirements = $('#agree_to_requirements');

  function checkBoxClicked() {
    if (agreeToRequirements.is(':checked')) {
      joinProject.removeAttr('disabled');
    } else {
      joinProject.attr('disabled', 'true');
    }
  }

  checkBoxClicked();

  agreeToRequirements.change(function() {
    checkBoxClicked($(this));
  });

  joinProject.click(function() {
    if (!joinProject.attr('disabled')) {
      if ({{!s.account.type}}) {
        returnWhenSignedIn();
      } else {
        getResponse(window.location.pathname + '/volunteer', {}, function(response) {
          if(response.success){
            window.location = '';
          }else{
            showGeneralResponse('{{l.unknownError}}', true);
          }
        }, function() {
          showGeneralResponse('{{l.unableToConnect}}', true);
        });
      }
    }
  });

  leaveProject.click(function() {
    getResponse(window.location.pathname + '/leave', {}, function(response) {
      if(response.success){
        window.location = '';
      }else{
        showGeneralResponse('{{l.unknownError}}', true);
      }
    }, function() {
      showGeneralResponse('{{l.unableToConnect}}', true);
    });
  });
});
