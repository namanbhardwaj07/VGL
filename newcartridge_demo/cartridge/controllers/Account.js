'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('SubmitRegistration', function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var Transaction = require('dw/system/Transaction');
        var registrationForm = server.forms.getForm('profile');
        Transaction.wrap(function () {
            var newCustomer = session.customer;
            var newCustomerProfile = newCustomer.getProfile();
            newCustomerProfile.birthday = new Date(registrationForm.customer.birthday.value);
            newCustomerProfile.custom.altMobileNumber = registrationForm.customer.altphone.value;
        });
    });
    next();
});


server.append('EditProfile', function (req, res, next) {
    var Calendar = require('dw/util/Calendar');
    var StringUtils = require('dw/util/StringUtils');
    var profileForm = server.forms.getForm('profile');
    profileForm.customer.altphone.value = req.currentCustomer.raw.profile.custom.altMobileNumber;
    var birthday = new Calendar(req.currentCustomer.raw.profile.birthday);
    profileForm.customer.birthday.value = StringUtils.formatCalendar(birthday, 'yyyy-MM-dd');
    next();
});

server.append('SaveProfile', function (req, res, next) {
    var Transaction = require('dw/system/Transaction');
    var profileForm = server.forms.getForm('profile');
    var result = {
        altphone: profileForm.customer.altphone.value,
        birthday: profileForm.customer.birthday.value,
    };
    if (profileForm.valid) {
        res.setViewData(result);
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            Transaction.wrap(function () {
                req.currentCustomer.raw.profile.birthday = new Date(formInfo.birthday);
                req.currentCustomer.raw.profile.custom.altMobileNumber = formInfo.altphone;
            });
        });
    }
    next();
});

module.exports = server.exports();