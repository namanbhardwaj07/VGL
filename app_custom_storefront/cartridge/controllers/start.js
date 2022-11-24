'use strict';


var server = require('server');


var func = require('*/cartridge/scripts/newscripts');

server.get('Start',
    func.a1,
    func.a2,
    function (req, res, next) {




       // res.json({message : 'hello world'});


       res.render('starttemplate');


        next();
    });






server.get('Show', function (req, res, next) {


    res.json({value : 'hello world'});


    //res.render('showtemplate');


    next();
});

module.exports = server.exports();