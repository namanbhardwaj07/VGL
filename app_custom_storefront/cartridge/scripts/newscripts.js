'use strict'


function a1(req,res,next)
{
    res.print("this is middilware function 1 </br>")

    var getviewdata = res.getViewData();
    var list = "naman";
    getviewdata.list=list;

    res.setViewData(getviewdata);
    
    next();
}



function a2(req,res,next)
{
    res.print("this is middilware function 2 </br>");

    var ex = res.getViewData();

    res.print(ex.list);


    next();
}


module.exports = {
    a1:a1,
    a2:a2
};
