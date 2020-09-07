const express = require('express');
const { monthsShort } = require('moment');
const app = express();




app.get('/getFaq', checkAuth,async (req, res, next) => {
    try{
      var params=req.query
      var page =1
      var limit =50
      if(params.page) page=params.page
      if(params.limit) limit=parseInt(params.limit)
      var offset=(page-1)*limit
     
     
      //Get All Categories
      var findData=await FAQ.findAll({
        attributes:['id','question','answer','status','language'],
        where :{companyId :req.parentCompany},
        order: [
          ['createdAt','DESC']
        ],      
        offset: offset, 
        limit: limit,

        
      })

      if(findData.length>0) return responseHelper.post(res, appstrings.success,findData, 200);
      return responseHelper.post(res, appstrings.no_record,{}, 204);

 }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});


app.get('/document', checkAuth,async (req, res, next) => {
  try{
   
   
    //Get All Categories
    const findData=await DOCUMENT.findOne({
      attributes:['id','aboutus','aboutusLink','privacyContent','termsContent','termsLink','privacyLink'],
      where :{companyId :req.parentCompany},
    })


    if(findData) return responseHelper.post(res, appstrings.success,findData);
   else  return responseHelper.post(res, appstrings.no_record,null, 204);

}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

app.post('/contactus', checkAuth,async (req, res, next) => {
  try{
   
    var params=req.body
    let responseNull=  commonMethods.checkParameterMissing([params.email,params.query])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
   
  
    //Get All Categories
    const findData=await CONTACTUS.create({
      email:params.email,
      query:params.query,
      phoneNumber:params.phoneNumber,
      userId:req.id,

    })


    
var notifUserData={title:appstrings.contact_title+" , Date: "+commonMethods.formatAMPM(new Date()),
description:appstrings.contact_title +" Info : "+commonMethods.short(params.query,70),
userId:req.parentCompany,
orderId:"",
role:1}

   if(findData) {
    commonNotification.insertNotification(notifUserData)

    return responseHelper.post(res, appstrings.query_save,null);
   }
   else  return responseHelper.post(res, appstrings.oops_something,null, 400);

}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

module.exports = app;