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

    var strUrl = "https://eservices.hagerty.com/Api/Vehicle/v3/e72c154d/US/Vehicles/1/1965/122/3023/397/186/51";
    var request = fetch(strUrl)
      .then(function (res) {
        return res.json();
      }).then(function (data) {
        console.log(data);
        console.log(data[0]);
        console.log(app.getArgument('Year'));


        var carValue = `The ${data[0].text} is worth $${data[0].weightedAverageValue} dollars`;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse(carValue)
            .addBasicCard(app.buildBasicCard(carValue)
              .setImage('https://o.aolcdn.com/images/dims3/GLOB/crop/4220x2374+0+0/resize/800x450!/format/jpg/quality/85/http://o.aolcdn.com/hss/storage/midas/1cce1f0e74ac5eef38a9584739e02479/205232832/2018+Mustang+design+sketch++%283%29.jpg', 'Darth Vader Mustang'))
            .addSimpleResponse('Would you like to value another vehicle Dan?')
            .addSuggestions(['Sure', 'No thanks']));
        } else {
          app.ask('I have no idea what you just said');
        }

      });

    
    /*

        var factPrefix = test[0].weightedAverageValue;
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
          app.ask(app.buildRichResponse()
            .addSimpleResponse(factPrefix)
            .addBasicCard(app.buildBasicCard(fact)
              .setImage('https://o.aolcdn.com/images/dims3/GLOB/crop/4220x2374+0+0/resize/800x450!/format/jpg/quality/85/http://o.aolcdn.com/hss/storage/midas/1cce1f0e74ac5eef38a9584739e02479/205232832/2018+Mustang+design+sketch++%283%29.jpg', 'Darth Vader Mustang'))
            .addSimpleResponse('Would you like to value another vehicle Dan?')
            .addSuggestions(['Sure', 'No thanks']));
        } else {
          app.ask('I have no idea what you just said');
        }

        /*

        console.log(app.getArgument('Year'));

        let rawData = app.getRawInput();
        let matchVehicle = rawData.match(/\d{4}.*$/ig);
        let factPrefix;
        let fact = "Value your vehicle!";

        if (app.getRawInput().indexOf('ford mustang') > 1) {
          factPrefix = "Why yes, your" + matchVehicle + " is worth $57,000. Impressive...most impressive.";
        } else {
          factPrefix = 'Sorry, we couldn\'t find a value for that vehicle. Please try again.';
        }
         */

  }

  let actionMap = new Map();
  actionMap.set('tell.value', tellValue);
  GoogleApp.handleRequest(actionMap);
});

var server = expressApp.listen(expressApp.get('port'), function () {
  console.log('Node app is running on port', expressApp.get('port'));
});