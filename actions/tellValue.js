var google = require('actions-on-google').ApiAiApp;
var fetch = require('node-fetch');

/**
 * User Functions
 */
var constants = require('../_CONSTANTS.js');
var numberWithCommas = require('../helpers/numbers-with-commas.js');
/** END USER FUNCTIONS */

module.exports = hvtValueResponse;

function hvtValueResponse(request, response) {

    var GoogleApp = new google({
        request,
        response
    });

    function tellValue(app) {

        // structure API query
        var year = app.getArgument('Year'),
            make = app.getArgument('Make'),
            model = app.getArgument('Model');

        console.log('App', app);

        console.log('User Input', `${year} ${make} ${model}`);

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

                //get key with value           
                var hasValueKey = null;
                vehicleValue.forEach(function(v, i) {
                    if (v.weightedAverageValue != null && v.text != null && hasValueKey == null) {
                        hasValueKey = i;
                    }
                });

                console.log('hasValueKey', hasValueKey);

                // first value foound
                var firstCarFullName = vehicleValue[hasValueKey].text,
                    firstCarAverageValue = numberWithCommas(vehicleValue[hasValueKey].weightedAverageValue);

                var carValue = `The ${firstCarFullName} is worth $${firstCarAverageValue}`;
                if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
                    app.ask(app.buildRichResponse()
                        .addSimpleResponse(carValue)
                        .addBasicCard(app.buildBasicCard(carValue)
                            .setImage('https://s3.amazonaws.com/culturesurvey.greatplacetowork.com/public/prd_logos_v11/Flat-Color-Icon_Wordmark-1000x230_calogo3270.jpg', 'Hagerty'))
                        .addSimpleResponse('Would you like to value another vehicle?')
                        .addSuggestions(['Sure', 'No thanks']));
                } else {
                    app.ask(carValue);
                }

            })
            .catch(function(error) {
                console.log('Request failed', error)
            });

    }

    let actionMap = new Map();
    actionMap.set('tell.value', tellValue);
    GoogleApp.handleRequest(actionMap);

}