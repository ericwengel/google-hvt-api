var express = require('express');
var google = require('actions-on-google').ApiAiApp;
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
    var vehicleToDecode = JSON.stringify(vehicleString);

    // first decode URL
    var decodeVehicle = 'https://www.hagerty.com/apps/valuationtools/Api/Search/Decode/Vehicle';
    var vehicleInfoURL = "https://eservices.hagerty.com/Api/Vehicle/v3/e72c154d/US/Vehicles/1/";

    // make first call
    var result = fetch(decodeVehicle, {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: vehicleToDecode
      }).then(function (response) {
        // first call response
        return response.json(); // pass the data as promise to next then block
      }).then(function (vehicleData) {

        console.log('------------------');
        console.log(vehicleData);
        console.log(vehicleData.year);
        console.log(vehicleData.year.id);
        console.log('------------------');

        // take decode data and make request to api
        var year = vehicleData.year.id,
          make = vehicleData.make.id,
          model = vehicleData.model.id;

        var valueRequestURLBuilder = `${vehicleInfoURL}${year}/${make}/${model}`;

        // make second call
        return fetch(valueRequestURLBuilder, {
          method: 'get'
        }); // make a 2nd request and return a promise

      })
      .then(function (response) {
        // response from 2nd call
        console.log("------------ RESPONSE FROM 2ND CALL RECEIVED -------")
        return response.json();
      }).then(function (vehicleValue) {
        //display 2nd call
        console.log(vehicleValue);
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