{% strings 'errors.json' %}

var findInputs = 'input, textarea';

function defaultValidation(form, inputs) {
  var missingRequirements = {};
  for (frame in inputs) {
    var fields = form.find('#' + frame).find(findInputs);
    var optional = (form.find('#' + frame).attr('optional') == 'true');
    var empty = false;

    missingRequirements[frame] = [];

    for (var i = 0; i < fields.length; i++) {
      if ($(fields[i]).val() == '') empty = true;
    }

    missingRequirements[frame].push({
      condition: empty && !optional,
      message: "{{l.emptyField}}"
    });

    if (!empty && fields.attr('type') == '_date') {
      var hour = $(fields[0]).val();
      var minute = $(fields[1]).val();
      var day = $(fields[2]).val();
      var month = $(fields[3]).val();
      var year = $(fields[4]).val();

      var invalidDateValue = false;

      if (hour < 0 || hour > 24) {
        invalidDateValue = true;
        missingRequirements[frame].push({
          condition: true,
          message: "{{l.invalidHour}}"
        });
      }

      if (minute < 0 || minute > 59) {
        invalidDateValue = true;
        missingRequirements[frame].push({
          condition: true,
          message: "{{l.invalidMinute}}"
        });
      }

      if (day < 1 || day > 31) {
        invalidDateValue = true;
        missingRequirements[frame].push({
          condition: true,
          message: "{{l.invalidDay}}"
        });
      }

      if (month < 1 || month > 12) {
        invalidDateValue = true;
        missingRequirements[frame].push({
          condition: true,
          message: "{{l.invalidMonth}}"
        });
      }
      console.log((new Date(Date.UTC(year, month - 1, day + 1))).getHours());
      if (!invalidDateValue && Date.UTC(year, month - 1, day + 1) < new Date()) {
        missingRequirements[frame].push({
          condition: true,
          message: "{{l.datePassed}}"
        });
      }
    }
  }
  return missingRequirements;
}

function submitForm(target, query) {

  $(target).find('.field_issues').each(function() {
    $(this).hide();
  });

  var inputs = {};

  var inputFrames = $(target).find('.field_frame').each(function() {
    var frame = $(this);
    var frameId = frame.attr('id');
    var input = frame.find(findInputs).each(function() {
      if ($(this).attr('id')) {
        if (!inputs[frameId]) inputs[frameId] = [];
        inputs[frameId].push($(this).val());
      } else {
        inputs[frameId] = $(this).val();
      }
    });

  });

  var form = $(target);

  function validateForm(fieldFrames) {
    var formReady = true;
    for (ff in fieldFrames) {
      var fieldFrame = form.find('#' + ff);
      fieldFrame.find(findInputs).attr('error', null);
      var requirements = fieldFrames[ff];
      var unmetRequirements = [];
      for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i];
        var targetField = (requirement.id) ? fieldFrame.find('#' + requirement.id) : fieldFrame.find(findInputs);
        if (requirement.condition == true) {
          targetField.attr('error', '');
          unmetRequirements.push(requirement.message);
        } else {}
      }
      var fieldIssues = fieldFrame.find('.field_issues');
      if (unmetRequirements.length > 0) {
        fieldIssues.html(unmetRequirements.join('<br>'));
        fieldIssues.show();
        //This was the first field with errors
        if (formReady == true) {
          focus($(fieldFrame.find(findInputs)));
        }
        formReady = false;
      } else {
        fieldIssues.hide();
      }
    }
    return formReady;
  }

  var requirementLists = [defaultValidation, formConfig.clientValidation];
  var allRequirements = {};

  for (list in requirementLists) {
    var requirementList = requirementLists[list](form, inputs);
    for (field in requirementList) {
      if (!allRequirements[field]) allRequirements[field] = [];
      allRequirements[field] = allRequirements[field].concat(requirementList[field]);
    }
  }

  if (form.attr('id')) {
    setCookie('GET_source_page', window.location.href.split('#')[0] + '#' + form.attr('id'));
  }

  if (validateForm(allRequirements)) {

    if (typeof(query) == 'function') {
      //This is used for forms that use sockets
      query(inputs);
    } else {
      getResponse(query, inputs, function(response) {
        if (response.error) {
          showGeneralResponse(response.error, true);
        } else if (response.message) {
          showGeneralResponse(response.message);
        } else {
          validateForm(response.corrections);
        }
      }, function() {
        showGeneralResponse('{{l.unableToConnect}}', true);
      });
    }
  }
}
