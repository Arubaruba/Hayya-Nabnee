var mime = require('mime');
var templates = require('./resources/templates');

module.exports = function(request, response, dirs){

  var strings = templates.stringsFunc({locale:});

  function incorrectPath(){
    response.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    response.end('Static file not found');
  }

  var staticType = dirs[2];

  if(staticType == 'g'){

  }else if(staticType == 'l'){
    var defaultVars = {
      config: config,
    }
  }else{
    incorrectPath();
  }
}
