'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');



function getDemoService() {
	var serviceObj = LocalServiceRegistry.createService("agify.http.get", {
		createRequest: function(svc, args){
			svc.setRequestMethod("GET");
			svc.addParam('name', args.name);
		},
		parseResponse: function(svc, client) {
			return client.text;
		},
		mockCall: function(svc, client){
		    return {
				statusCode: 200,
				statusMessage: "Success",
				text: "MOCK RESPONSE (" + svc.URL + ")"
			};
		},
		filterLogMessage: function(msg) {
			return msg.replace("headers", "OFFWITHTHEHEADERS");
		}
	});
	
	return serviceObj;
}

function getCurrencyConverterService() {
	var serviceObj = LocalServiceRegistry.createService("http.currencyconverter.test", {
		createRequest: function(svc, args){
			svc.setRequestMethod("GET");
			svc.addParam('apiKey', svc.configuration.credential.user);
		},
		parseResponse: function(svc, client) {
			return client.text;
		},
		mockCall: function(svc, client){
		    return {
				statusCode: 200,
				statusMessage: "Success",
				text: "MOCK RESPONSE (" + svc.URL + ")"
			};
		},
		filterLogMessage: function(msg) {
			return msg;
		}
	});
	
	return serviceObj;

}

module.exports = {
	getCurrencyConverterService: getCurrencyConverterService,
	getDemoService: getDemoService
}


