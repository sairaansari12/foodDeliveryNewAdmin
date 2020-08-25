
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

COMPANYRATING.belongsTo(USERS,{foreignKey: 'userId'})



app.get('/',superAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      
      var compData= await commonMethods.getAllCompanies(req.companyId)

    var cdata= await commonMethods.getAllParentCategories(req.companyId)
return res.render('super/ratings/ratingsListing.ejs',{catData:cdata,compData:compData});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});




app.post('/getData',superAuth, async (req, res, next) => {
    
  var params=req.body
    try {
      
    var page =1
    var limit =100
    var categoryId =""

    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.categoryId) categoryId=params.categoryId

    var offset=(page-1)*limit


    var ratingData = await SUBORDERS.findAndCountAll({
      attributes: ['id','rating','review','serviceId','orderId','createdAt'],
  
      where: {
        rating:  {[Op.not]: '0'}

      },
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        },
{
        model: SERVICES,
        attributes: ['id','categoryId','name'],
        required: true,
        include :[{
          model: CATEGORY,
          as :"category",
          attributes: ['id','connectedCat','name'],
          where: {
            connectedCat: {
              [Op.like]: '%'+ categoryId + '%'},
              companyId:params.compId
            },    
      
          required: true
          }]


        }
      
      
      ],
      order: [['createdAt', 'DESC']],
      distinct:true,
      offset: offset, limit: limit,

    })
    

   // console.log(">>>>>>>>>>>>>>>",ratingData[0])
    const ratData = await SUBORDERS.findOne({
      attributes: [[sequelize.fn('avg', sequelize.col('rating')), 'totalRating']],
    where: {
      //serviceId:  params.serviceId
    }
    })
    
    var cdata= await commonMethods.getAllCategories(req.companyId)

    return responseHelper.post(res, appstrings.message,ratingData);

        //return res.render('super/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
    return res.render('super/ratings/addRatings.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});



app.post('/delete',superAuth,async(req,res,next) => { 
  
  var params=req.body
  var orderId=params.orderId
  var serviceId=params.serviceId

  try {

  let responseNull=  common.checkParameterMissing([orderId,serviceId])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

      const findData = await SUBORDERS.update({rating: '0',review :""},
     { where :{orderId :orderId, serviceId: serviceId }});
   
    return responseHelper.post(res, appstrings.delete_success,null);




    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});




app.get('/company/',superAuth, async (req, res, next) => {
    
  var params=req.query
    try {
      
      var compData= await commonMethods.getAllCompanies(req.companyId)

return res.render('super/ratings/companyRatings.ejs',{compData:compData});
      } catch (e) {
       return responseHelper.error(res, e.message, 400);
     
      }


});



app.post('/company/getData',superAuth, async (req, res, next) => {
    
  var params=req.body
    try {
      console.log(">>>>>>>>>>>>>>>>>",params)
    var page =1
    var limit =100
    var categoryId =""
var fromDate=""
var toDate=""
var where= {rating:  {[Op.not]: '0'}}
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.categoryId) categoryId=params.categoryId
    if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
    if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
    var offset=(page-1)*limit

    if(fromDate!="" && toDate!="")
    {
      where= {
        rating:  {[Op.not]: '0'},
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
      }
    }

    if(params.compId && params.compId!="")
    {
      where.companyId= params.compId
    }


    var ratingData = await COMPANYRATING.findAndCountAll({
      attributes: ['id','rating','review','userId','createdAt'],
  
      where: where,
      include: [
        {
        model: USERS,
        attributes: ['id','firstName','lastName','image'],
        required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct:true,
      offset: offset, limit: limit,

    })
    
var data={}
data.ratingData=ratingData

    var rating =0
    var dataRating=await commonMethods.getCompAvgRating(params.compId) 
    if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) rating=dataRating.dataValues.totalRating
    
    data.avgRating=rating

    return responseHelper.post(res, appstrings.message,data);

        //return res.render('super/ratings/ratingsListing.ejs',{avgRating : ratData.dataValues.totalRating,data:ratingData,catData:cdata});



      } catch (e) {
       return responseHelper.error(res, e.message, 400);
      // req.flash('errorMessage',e.message)
      // return res.redirect(superadminpath+"ratings");
      }


});



app.post('/company/delete',superAuth,async(req,res,next) => { 
  
  var params=req.body
  var userId=params.userId

  try {

  let responseNull=  common.checkParameterMissing([userId])
  if(responseNull) 
  
    return responseHelper.error(res, appstrings.required_field,400);

      const findData = await COMPANYRATING.update({rating: '0',review :""},
     { where :{userId :userId, companyId: req.id }});
   
    return responseHelper.post(res, appstrings.delete_success,null);




    } catch (e) {
      return responseHelper.error(res, e.message,400);
    }


 
});





module.exports = app;

//Edit User Profile
