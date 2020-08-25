const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Sequelize       = require('sequelize');
const Op             = require('sequelize').Op;


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////

SERVICERATINGS.belongsTo(ORDERS,{foreignKey: 'orderId'})
SERVICERATINGS.belongsTo(USERS,{foreignKey: 'userId'})


//SERVICE RATING
app.get('/serviceRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.serviceId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit


    var subData = await SERVICERATINGS.findAll({
      attributes: ['id','rating','review','createdAt'],
    
      where: {
        serviceId:  params.serviceId,
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await SERVICERATINGS.findOne({
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating']],
    where: {
      serviceId:  params.serviceId}
    })
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


//SERVICE RATING
app.get('/companyRatings', checkAuth,async (req, res, next) => {

  var params=req.query
  try{
    let responseNull=  commonMethods.checkParameterMissing([params.companyId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit


    var subData = await COMPANYRATING.findAll({
  
      where: {
        companyId:  params.companyId,
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: true
        }],
      order: [['createdAt', 'DESC']],
      offset: offset, limit: limit,

    })
    

    const ratData = await commonMethods.getCompAvgRating(params.companyId)
    

let dataToSend={}
if(subData && subData.length>0) 
{
  dataToSend.avgRating=ratData.dataValues.totalRating
  dataToSend.data=subData

  return responseHelper.post(res, appstrings.success,dataToSend)
}
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});



///////// Add Coupan /////////////////////////
app.post('/addRating', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.orderId,data.ratingData])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  var datatoUpdated=JSON.parse(JSON.stringify(data.ratingData))
  var employeeUpdated=JSON.parse(JSON.stringify(data.empRatingData))





    for(var h=0;h<datatoUpdated.length;h++)
    {


      await SERVICERATINGS.update({
        rating: datatoUpdated[h].rating,
        review: datatoUpdated[h].review
  
      },
      {where : {userId: req.id,serviceId : datatoUpdated[h].serviceId, orderId : data.orderId}},

       )}

       for(var h=0;h<employeeUpdated.length;h++)
       {
   
   
         await STAFFRATINGS.create({
           rating: employeeUpdated[h].rating,
           review: employeeUpdated[h].review,
           empId: employeeUpdated[h].empId,
           orderId: data.orderId


         });
        
        
         var findData=await EMPLOYEE.findOne({where:{id:employeeUpdated[h].empId}});

         var notifPushUserData={title:employeeUpdated[h].rating +" "+appstrings.new_rating_added+"  "+commonMethods.formatAMPM(new Date),
          description:employeeUpdated[h].rating +" "+ appstrings.new_rating_added+'  ' +commonMethods.formatAMPM(new Date) +" For order No- "+data.orderId,
          token:findData.dataValues.deviceToken,  
              platform:findData.dataValues.platform,
              userId :findData.id, role :4,
              orderId:data.orderId,
              notificationType:"FEEDBACK",status:0,
        }
        
        commonNotification.insertNotification(notifPushUserData)   
        commonNotification.sendEmpNotification(notifPushUserData)



        
        }


      return responseHelper.post(res, appstrings.rating_added,null);
      
    
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

///////// Add Coupan /////////////////////////
app.post('/addCompanyRating', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  


  
    
      await COMPANYRATING.create({
        rating: data.rating,
        foodQuality: data.foodQuality,
        foodQuantity: data.foodQuantity,
        packingPres: data.packingPres,
        review: data.review,
        userId:req.id,
        companyId:data.companyId
      });

      return responseHelper.post(res, appstrings.rating_added,null);
    }
    
  
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




module.exports = app;