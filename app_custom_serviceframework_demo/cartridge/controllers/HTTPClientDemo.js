'use strict';

var server = require('server');
var HTTPClient = require('dw/net/HTTPClient');

server.get('Start', function (req, res, next) {
	var name = req.querystring.name;
	var httpClient = new HTTPClient();
	var message;
	httpClient.open('GET', 'https://api.agify.io/?name=' + name);
	httpClient.setTimeout(3000);
	httpClient.send();
	if (httpClient.statusCode == 200)
	{
		message = httpClient.text;
		res.render('demoserviceresult', {response:message});
	}
	else
	{
		// error handling
		message="An error occurred with status code " + httpClient.statusCode;
	}
	next();
});

module.exports = server.exports();

