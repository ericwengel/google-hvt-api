var express = require('express');
var bodyParser = require('body-parser');
var expressApp = express();
expressApp.use(bodyParser.json());

/**
 * User Functions
 */
var constants = require('./_CONSTANTS.js');
var hvt = require('./actions/tellValue.js');
/** END USER FUNCTIONS */

expressApp.set('port', (process.env.PORT || constants.EXPRESS_DEFAULTS.DEFAULT_PORT));

// answer request
expressApp.post('/google-hvt-api', function(request, response) {
    hvt(request, response);
});

var server = expressApp.listen(expressApp.get('port'), function() {
    console.log('Node app is running on port', expressApp.get('port'));
});