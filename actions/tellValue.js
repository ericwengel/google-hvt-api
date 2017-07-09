var google = require('actions-on-google').ApiAiApp;

var GoogleApp = new google({
    request,
    response
});

function tellValue(app) {

    console.log(JSON.stringify(app));

    let rawData = app.getRawInput();
    let matchVehicle = rawData.match(/\d{4}.*$/ig);
    let factPrefix;
    let fact = "Value your vehicle!";

    if (app.getRawInput().indexOf('ford mustang') > 1) {
        factPrefix = "Why yes, your" + matchVehicle + " is worth $57,000. Impressive...most impressive.";
    } else {
        factPrefix = 'Sorry, we couldn\'t find a value for that vehicle. Please try again.';
    }

    if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
        app.ask(app.buildRichResponse()
            .addSimpleResponse(factPrefix)
            .addBasicCard(app.buildBasicCard(fact)
                .setImage('https://o.aolcdn.com/images/dims3/GLOB/crop/4220x2374+0+0/resize/800x450!/format/jpg/quality/85/http://o.aolcdn.com/hss/storage/midas/1cce1f0e74ac5eef38a9584739e02479/205232832/2018+Mustang+design+sketch++%283%29.jpg', 'Darth Vader Mustang'))
            .addSimpleResponse('Would you like to value another vehicle Dan?')
            .addSuggestions(['Sure', 'No thanks']));
    } else {\
        app.ask('I have no idea what you just said');
    }
}

let actionMap = new Map();
actionMap.set('tell.value', tellValue);
GoogleApp.handleRequest(actionMap);36