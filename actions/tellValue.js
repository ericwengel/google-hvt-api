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

        console.log('API.AI Arguments:', `${year} ${make} ${model}`);

        // shape decode strings
        var vehicleString = {
            year: app.getArgument('Year'),
            make: app.getArgument('Make'),
            model: app.getArgument('Model')
        };
        var vehicleToDecode = JSON.stringify(vehicleString);

        // make first call
        var result = fetch(constants.REQUESTU_URLS.DECODE_VEHICLE, {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: vehicleToDecode
            }).then(function (response) {
                return response.json();
            }).then(function (vehicleData) {

                // take decode data and make request to api
                var year = vehicleData.year.id,
                    make = vehicleData.make.id,
                    model = vehicleData.model.id;

                var valueRequestURLBuilder = `${constants.REQUESTU_URLS.VEHICLE_INFO_URL}${year}/${make}/${model}`;

                // make second call
                return fetch(valueRequestURLBuilder, {
                    method: 'get'
                });

            })
            .then(function (response) {
                return response.json();
            }).then(function (vehicleValue) {
                //display 2nd call
                console.log(vehicleValue);

                var listSelector;
                vehicleValue.forEach(function (element) {
                    listSelector.push(
                        app.buildOptionItem('VALUE')
                        .setTitle(`${vehicleString.year} ${vehicleString.make} ${vehicleString.model}`)
                        .setDescription(`${element.text}`)
                        .setImage('http://example.com/math_and_prime.jpg', 'This car')
                    )
                });

                // first value
                var firstCarFullName = vehicleValue[0].text,
                    firstCarAverageValue = numberWithCommas(vehicleValue[0].weightedAverageValue);

                var carValue = `The ${firstCarFullName} is worth $${firstCarAverageValue}`;
                if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

                    app.askWithList(app.buildRichResponse()
                        .addSimpleResponse('Alright'),
                        // Build a list
                        app.buildList('Things to learn about')
                        // Add the first item to the list
                        .addItems(listSelector)
                    )

                    /*app.ask(app.buildRichResponse()
                        .addSimpleResponse(carValue)
                        .addBasicCard(app.buildBasicCard(carValue)
                            .setImage('https://o.aolcdn.com/images/dims3/GLOB/crop/4220x2374+0+0/resize/800x450!/format/jpg/quality/85/http://o.aolcdn.com/hss/storage/midas/1cce1f0e74ac5eef38a9584739e02479/205232832/2018+Mustang+design+sketch++%283%29.jpg', 'Darth Vader Mustang'))
                        .addSimpleResponse(constants.USER_PROMPTS.SUCCESS_NEXT));
                    //.addSuggestions(['Sure', 'No thanks']));
                    */

                } else {
                    // figure out device compatibility fallback here
                }

            })
            .catch(function (error) {
                console.log('Request failed', error)
            });

    }

    let actionMap = new Map();
    actionMap.set('tell.value', tellValue);
    GoogleApp.handleRequest(actionMap);
}