var express = require('express');
var bodyParser = require('body-parser');
/**
 * User Functions
 */
var constants = require('./_CONSTANTS.js');
var hvt = require('./actions/tellValue.js');
/** END USER FUNCTIONS */

var expressApp = express();
expressApp.use(bodyParser.json());

expressApp.set('port', (process.env.PORT || constants.EXPRESS_DEFAULTS.DEFAULT_PORT));

expressApp.get('/', function (request, response) {
  require('./actions/hello-world.js')(request, response);
});

// answer request
expressApp.post('/google-hvt-api', function (request, response) {
  hvt.hvtValueResponse(request, response);
});

var server = expressApp.listen(expressApp.get('port'), function () {
  console.log('Node app is running on port', expressApp.get('port'));
});