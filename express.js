var express = require('express');
var google = require('actions-on-google').ApiAiApp;
var bodyParser = require('body-parser');
var expressApp = express();
expressApp.use(bodyParser.json());

// include constants
//require('./_CONSTANTS.js');

expressApp.set('port', (process.env.PORT || 5000));

expressApp.get('/', function (request, response) {
  response.send("Hello World");
});

// answer request
expressApp.post('/google-hvt-api', function(request, response) {
  require('./actions/tellValue.js');
});

var server = expressApp.listen(expressApp.get('port'), function () {
  console.log('Node app is running on port', expressApp.get('port'));
});