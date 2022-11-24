'use strict'

var server = require('server');

server.extend(module.superModule);

server.prepend('Start' , function(req , res, next){

    res.print("this is prepend </br>");


    next();
});


server.append('Start' , function(req , res, next){

    res.print("this is append </br>");


    next();
});


server.replace('Show' , function(req , res, next){

    res.print("this is replace </br>");


    next();
});



module.exports=server.exports();