'use strict';
var server = require('server');
server.get('ShowProduct', function(req, res, next){
    const ProductMgr = require('dw/catalog/ProductMgr');


    const pid = req.querystring.pid;

    var ids = {
        id: pid
    }
       
        const product = ProductMgr.getProduct(pid);
        if(product==null)
        {
            res.render('productnotfound' , ids);
        }
        else{
        
        const productDetails = new Object();
        productDetails.name=product.name;
        productDetails.id=product.ID;
        productDetails.longDescription = product.longDescription  ;
        res.render('productfound', productDetails);

        }
        
        

    

    
   
    next();
});


module.exports = server.exports();