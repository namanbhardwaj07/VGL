'use strict';

var server =  require('server');


server.get("Start" , function(req , res , next){

    
    res.render("ismltest");


    next();
});



module.exports = server.exports();