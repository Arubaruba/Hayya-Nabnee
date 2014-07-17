function completeProject(projectId) {

  var sendInfo = {
    projectId: projectId,
    volunteers: []
  };

  $('.volunteer').each(function(){
    if($(this).find('input').is(':checked')){
      sendInfo.volunteers.push($(this).attr('volunteer_id'));
    }
  });

  //The server will simply redirect on success
  getResponse('complete/submit_report', sendInfo, function(response){
    if(response.error) showGeneralResponse(response.error, true);
  });
}
