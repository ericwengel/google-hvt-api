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
        var vehicleString = {
            year: '1967',
            make: 'Ford',
            model: 'Mustang'
        };

        // shape decode strings        
        var vehicleToDecode = JSON.stringify(vehicleString);

        console.log('API.AI Arguments:', `${vehicleString.year} ${vehicleString.make} ${vehicleString.model}`);
        console.log('HVT API Call: ', constants.REQUEST_URLS.DECODE_VEHICLE);

        // make first call
        var result = fetch(constants.REQUEST_URLS.DECODE_VEHICLE, {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: vehicleToDecode
            }).then(function(response) {
                return response.json();
            }).then(function(vehicleData) {

                //display 1nd call
                console.log('First Call: ', vehicleData);

                // take decode data and make request to api
                var year = vehicleData.year.id,
                    make = vehicleData.make.id,
                    model = vehicleData.model.id;

                var valueRequestURLBuilder = `${constants.REQUEST_URLS.VEHICLE_INFO_URL}${year}/${make}/${model}`;

                // make second call
                return fetch(valueRequestURLBuilder, {
                    method: 'get'
                });

            })
            .then(function(response) {
                return response.json();
            }).then(function(vehicleValue) {
                //display 2nd call
                //console.log('Second Call: ', vehicleValue);

                if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

                    var list = app.buildList(`${vehicleString.year} ${vehicleString.make} ${vehicleString.model} Submodels`)
                    for (var i = 1; i < 6; i++) {
                        var valueList = vehicleValue[i];
                        if (valueList.weightedAverageValue != 'null') {
                            //console.log('valueList -- added to array', valueList);
                            list.addItems(app.buildOptionItem(valueList.text)
                                .setTitle(valueList.text))
                        }
                    }

                    app.askWithList('There seem to be submodels for this vehicle, please choose one below.', list);


                } else {
                    // figure out device compatibility fallback here
                }

            })
            .catch(function(error) {
                console.log('Request failed', error)
            });

    }

    function itemSelected(app) {
        // Get the user's selection
        const param = app.getContextArgument('actions_intent_option',
            'OPTION').value;

        console.log('Parameter:', param);
        /*
        // Compare the user's selections to each of the item's keys
        if (!param) {
            app.ask('You did not select any item from the list or carousel');
        } else if (param === 'MATH_AND_PRIME') {
            app.ask('42 is an abundant number because the sum of its…');
        } else if (param === 'EGYPT') {
            app.ask('42 gods who ruled on the fate of the dead in the ');
        } else if (param === 'RECIPES') {
            app.ask('Here\'s a beautifully simple recipe that\'s full ');
        } else {
            app.ask('You selected an unknown item from the list or carousel');
        }
        */
    }


    let actionMap = new Map();
    actionMap.set('tell.value', tellValue);
    //actionMap.set(GoogleApp.StandardIntents.OPTION, itemSelected);
    GoogleApp.handleRequest(actionMap);

    //console.log('Standard Intents', GoogleApp.StandardIntents);
}