var path = require('path');
var config = require('../../config.json');
var routes = require('../../routes.json');

function loadRoutes(subroutes) {
  for (routeName in subroutes) {
    var route = subroutes[routeName];
    if (route.scriptPath) {
      var parts = route.scriptPath.split('#');
      var scriptPath = path.resolve(__dirname, '../../routes', parts[0]);
      var script = require(scriptPath);
      if (!script) {
        throw ('The script \"' + scriptPath + '\" could not be loaded');
      } else {
        if (script[parts[1]]) {
          route.script = script[parts[1]];
        } else {
          throw ('The script \"' + scriptPath + '\" is missing a function named \"' + parts[1] + '\"');
        }
      }
    }
    if (route.dirs) loadRoutes(route.dirs);
  }
}

loadRoutes(routes);

module.exports = routes;
