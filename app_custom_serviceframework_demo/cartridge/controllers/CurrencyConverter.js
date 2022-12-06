'use strict';

var server = require('server');
var serviceFactory = require('~/cartridge/scripts/serviceFactory');
var currencyConverterForm = server.forms.getForm('currencyconverter');

server.get('Start', function (req, res, next) {

	currencyConverterForm.clear();
	res.render('ccservice/currencyconverter', 
	{
		ContinueURL : dw.web.URLUtils.https('CurrencyConverter-HandleForm'),
		ccForm : currencyConverterForm
	});
	next();
});

server.post('HandleForm', function (req, res, next) {
	var fromCurrency = currencyConverterForm.fromcurrency.value;
	var toCurrency = currencyConverterForm.tocurrency.value;
	if ( fromCurrency && toCurrency ){
		var service = serviceFactory.getCurrencyConverterService();
		service.URL += '/convert';
		service.addParam('q', fromCurrency +'_'+ toCurrency).addParam('compact', 'ultra');
		var result = service.call();
		var response = null;
		if(result.status == result.OK) {
			response = result.object
		}
		res.render('ccservice/ccsuccess', { ccForm: currencyConverterForm, response:response});
	} else {
		res.render('ccservice/ccerror', {
			ContinueURL : dw.web.URLUtils.https('CurrencyConverter-HandleForm'),
			ccForm : currencyConverterForm
		});
	}
	next();
});

module.exports = server.exports();

