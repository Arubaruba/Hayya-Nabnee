{% strings 'locale.json' %}
{% strings 'errors.json' %}
{% strings 'discussion.json' %}

var socket = io.connect('{{s.config.ports.domain}}:{{s.config.ports.discussion}}');

socket.io.on('connect_error', function(){
  showGeneralResponse('{{l.unableToConnect}}', true);
});

socket.io.on('reconnect', function(){
  showGeneralResponse('{{l.reconnected}}', false);
});

var discussionId = '';

$(window).ready(function(){
  discussionId = $('meta#discussion_id').attr('discussion_id');
  socket.emit('join',discussionId);
});

var formConfig = {
  clientValidation: function(form, inputs) {
    return {};
  }
}

function toggleReplyToMessage(messageId) {
  var message = $('#' + messageId);
  var writeReply = $(message.find('#write_reply'));
  var toggleReply = $(message.find('#toggle_message_reply'));
  if (writeReply.is(':visible')) {
    writeReply.hide();
    toggleReply.attr('toggled_on', null);
  } else {
    writeReply.show();
    toggleReply.attr('toggled_on', '');
  }
}

socket.on('load_message', function (data) {
  var appendHere = (data.replyTo) ? $('#'+data.replyTo).find('.shift_over') : $("#messages_root")
  if(data.messageHTML){
    appendHere.prepend(data.messageHTML);
  }
});

var messageContentFocused = function(target){
  $(target).attr('expanded','');
}

var closePost = function(target){
  var textArea = $(target).parent().parent().find('textarea');
  textArea.attr('expanded',null);
  textArea.attr('style',null); //Remove width and height created by custom resizing
}

var postMessage = function(target){

  if ({{!s.account.type}}) {
    returnWhenSignedIn();
  }else{
    var textArea = $(target).parent().parent().find('textarea');
    var messageBody = textArea.val();
    if(messageBody){
      var replyTo = $(target).parent().find('meta').attr('message_id');
      var packet = {
        body:messageBody,
        accountId : '{{s.account._id+''}}',
        discussionId : discussionId,
        replyTo : (replyTo) ? replyTo : '',
        locale : '{{l.locale}}'
      }
      textArea.val('');
      socket.emit('post_message',packet);
    }else{
      showGeneralResponse('{{l.messageNeedsContent}}');
      textArea.focus();
    }
  }
}
