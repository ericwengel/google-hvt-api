var express = require('express');
var google = require('actions-on-google').ApiAiApp;
var FormData = require('form-data');
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var expressApp = express();
expressApp.use(bodyParser.json());

expressApp.set('port', (process.env.PORT || 5000));

expressApp.get('/', function (request, response) {
  response.send("Hello World");
});

// answer request
expressApp.post('/google-hvt-api', function (request, response) {
  var GoogleApp = new google({
    request,
    response
  });

  function tellValue(app) {

    // structure API query
    var year = app.getArgument('Year'),
      make = app.getArgument('Make'),
      model = app.getArgument('Model');

    console.log(`${year} ${make} ${model}`);

    // shape decode strings
    var vehicleString = {
      year: app.getArgument('Year'),
      make: app.getArgument('Make'),
      model: app.getArgument('Model')
    };
    var vehicleToDecode = new FormData();
    vehicleToDecode.append("json", JSON.stringify(vehicleString))
    
    // first decode URL
    var decodeVehicle = 'https://www.hagerty.com/apps/valuationtools/Api/Search/Decode/Vehicle';
    var vehicleInfo = "https://eservices.hagerty.com/Api/Vehicle/v3/e72c154d/US/Vehicles/";

    var result = fetch(decodeVehicle, {        
        method: 'post',
        body: vehicleToDecode
      }).then(function (response) {        
        // decode response
        return response.json(); // pass the data as promise to next then block
      }).then(function (vehicleData) {

        // take decode data and make request to api
        var year = vehicleData.year.id,
            make = vehicleData.make.id,
            model = vehicleData.make.id;

        return fetch(`${vehicleInfo}${year}${make}${model}`); // make a 2nd request and return a promise

      })
      .then(function (response) {
        console.log(response);
        //return response.json();
      })
      .catch(function (error) {
        console.log('Request failed', error)
      });

  }

  let actionMap = new Map();
  actionMap.set('tell.value', tellValue);
  GoogleApp.handleRequest(actionMap);
});

var server = expressApp.listen(expressApp.get('port'), function () {
  console.log('Node app is running on port', expressApp.get('port'));
});