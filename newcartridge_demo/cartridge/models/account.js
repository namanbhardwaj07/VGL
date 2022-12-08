'use strict';

var base = module.superModule;

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel) {
    base.call(this, currentCustomer, addressModel, orderModel);
    var Calendar = require('dw/util/Calendar');
    var StringUtils = require('dw/util/StringUtils');
    var birthday = new Calendar(currentCustomer.raw.profile.birthday);
    this.profile.birthday = StringUtils.formatCalendar(birthday, 'yyyy-MM-dd');
    this.profile.altphone = currentCustomer.raw.profile.custom.altMobileNumber;
}

account.prototype = base.prototype;

module.exports = account;