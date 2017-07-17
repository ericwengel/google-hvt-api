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
            year: '1969', //app.getArgument('Year'),
            make: 'Ford', //app.getArgument('Make'),
            model: 'Mustang' //app.getArgument('Model')
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
            }).then(function (response) {
                return response.json();
            }).then(function (vehicleData) {

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
            .then(function (response) {
                return response.json();
            }).then(function (vehicleValue) {
                //display 2nd call
                console.log('Second Call: ', vehicleValue);

                // build list of vehicles
                var listSelector = [
                            app.buildOptionItem('SELECTION_KEY_ONE', ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
                            .setTitle('1969 Ford Mustang GT 2dr Coupe 8-cyl. 351cid/250hp 2bbl'),
                            app.buildOptionItem('SELECTION_KEY_TWO', ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'])
                            .setTitle('1969 Ford Mustang Boss 429 2dr SportsRoof  8-cyl. 429cid/375hp 4bbl')];
                /*
                //for (var i = 0; i < vehicleValue.length; i++) {
                for (var i = 0; i < 10; i++) {
                    var valueList = vehicleValue[i];
                    if (valueList.weightedAverageValue != 'null') {
                        console.log('valueList -- added to array', valueList);
                        listSelector.push(
                            app.buildOptionItem(`Choice_${i}`, ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
                            .setTitle(`${vehicleString.year} ${vehicleString.make} ${vehicleString.model}`)
                        )
                    }
                }
                */

                console.log(listSelector);

                if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {

                    app.askWithList('What is your sub model?',
                        app.buildList('1969 Ford Mustang Submodels')
                        .addItems(listSelector));

                    /*
                    app.askWithlist('There seem to be submodels for this vehicle, please choose one below.',
                        app.buildList(`${vehicleString.year} ${vehicleString.make} ${vehicleString.model} Submodels`)
                            .addItems(listSelector));
                        
                        /*.addItems([
                            app.buildOptionItem(SELECTION_KEY_ONE, ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
                            .setTitle('Number one'),
                            app.buildOptionItem(SELECTION_KEY_TWO, ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'])
                            .setTitle('Number two'),
                        ]));
                        */

                    /*
                    app.askWithList(app.buildRichResponse()
                        .addSimpleResponse('Alright'),
                        // Build a list
                        app.buildList('Things to learn about')
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

/**
 * 
 * List example...
const app = new ActionsSdkApp({request, response});

function welcomeIntent (app) {
  app.askWithlist('Which of these looks good?',
    app.buildList('List title')
     .addItems([
       app.buildOptionItem(SELECTION_KEY_ONE,
         ['synonym of KEY_ONE 1', 'synonym of KEY_ONE 2'])
         .setTitle('Number one'),
       app.buildOptionItem(SELECTION_KEY_TWO,
         ['synonym of KEY_TWO 1', 'synonym of KEY_TWO 2'])
         .setTitle('Number two'),
     ]));
}

function optionIntent (app) {
  if (app.getSelectedOption() === SELECTION_KEY_ONE) {
    app.tell('Number one is a great choice!');
  } else {
    app.tell('Number two is a great choice!');
  }
}

const actionMap = new Map();
actionMap.set(app.StandardIntents.TEXT, welcomeIntent);
actionMap.set(app.StandardIntents.OPTION, optionIntent);
app.handleRequest(actionMap);
 */