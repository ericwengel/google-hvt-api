var express = require('express');
var google = require('actions-on-google').ApiAiApp;
var fetch = require('node-fetch');
var bodyParser = require('body-parser');
var expressApp = express();
expressApp.use(bodyParser.json());

var constants = require('./_CONSTANTS.js');

expressApp.set('port', (process.env.PORT || constants.EXPRESS_DEFAULTS.DEFAULT_PORT));

expressApp.get('/', function(request, response) {
    require('./actions/hello-world.js')(request, response);
});

// answer request
expressApp.post('/google-hvt-api', function(request, response) {
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
                    }).then(function(response) {
                        return response.json();
                    }).then(function(vehicleData) {

                        // take decode data and make request to api
                        var year = vehicleData.year.id,
                            make = vehicleData.make.id,
                            model = vehicleData.model.id;

                        var valueRequestURLBuilder = `${vehicleInfoURL}${year}/${make}/${model}`;

                        // make second call
                        return fetch(valueRequestURLBuilder, {
                            method: 'get'
                        });

                    })
                    .then(function(response) {
                        return response.json();
                    }).then(function(vehicleValue) {
                            //display 2nd call
                            console.log(vehicleValue);

                            // first value
                            var firstCarFullName = vehicleValue[0].text,
                                firstCarAverageValue = numberWithCommas(vehicleValue[0].weightedAverageValue);

                            var carValue = `The ${firstCarFullName} is worth $${firstCarAverageValue} dollars`;
                            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
                                app.ask(app.buildRichResponse()
                                    .addSimpleResponse(carValue)
                                    .addBasicCard(app.buildBasicCard(carValue)
                                        .addSimpleResponse('Would you like to value another vehicle?')
                                        .addSuggestions(['Sure', 'No thanks']));
                                }
                                else {
                                    app.ask('I have no idea what you just said');
                                }

                                function numberWithCommas(x) {
                                    var parts = x.toString().split(".");
                                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    return parts.join(".");
                                }

                            })
                        .catch(function(error) {
                            console.log('Request failed', error)
                        });

                    }

                let actionMap = new Map();
                actionMap.set('tell.value', tellValue);
                GoogleApp.handleRequest(actionMap);
            });

        var server = expressApp.listen(expressApp.get('port'), function() {
            console.log('Node app is running on port', expressApp.get('port'));
        });