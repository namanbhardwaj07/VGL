'use strict';

var server = require('server');
var serviceFactory = require('~/cartridge/scripts/serviceFactory');

server.get('Start', function (req, res, next) {
	var service = serviceFactory.getDemoService();
	var name = req.querystring.name;
    var requestBody = {name: name}; 
	var result = service.call(requestBody);
	var response = null;
	if(result.status == result.OK) {
		response = result.object;
	}
	res.render('serviceresponse', {response:response});
	next();
});

server.get('CCStart', function (req, res, next) {
	var apiEndPoint = req.querystring.apiName;
	var service = serviceFactory.getCurrencyConverterService();
	switch ( apiEndPoint ) {
		case "convert": 
			service.URL += '/convert';
			service.addParam('q', 'USD_INR').addParam('compact', 'ultra');
			break;
		case "currencies":
			service.URL += '/currencies';
			break;
		case "countries":
			service.URL += '/countries';
			break;
		default:
			next(new Error('Please provide valid API Name in the HTTP parameter'));
	}
	var result = service.call();
	var response = null;
	if(result.status == result.OK) {
		response = result.object
	}
	res.render('ccservice/ccserviceresponse', {response:response});
	next();
});

module.exports = server.exports();