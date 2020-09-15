const express = require('express');
const app = express();
const Op = require('sequelize').Op;
const moment   = require('moment');
const address = require('../../db/models/address');


COMPANY.hasOne(DOCUMENT,{foreignKey: 'companyId'})

app.get('/getCompanies', checkAuth,async (req, res, next) => {
  try{
    var params=req.query
   var category=params.categoryId
    var reqParam=false
   var lat=0
   var lng=0
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)

   var itemType=['0','1','2']
   if(params.itemType && params.itemType!="") itemType=[params.itemType,'2']
   var page =1
   var limit =20
   if(params.page) page=params.page
   if(params.limit) limit=parseInt(params.limit)
   var offset=(page-1)*limit


  let responseNull=  commonMethods.checkParameterMissing([params.deliveryType])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    //Get All Categories
    var newDate = moment(new Date()).format("MM/DD/YYYY");


    where= {
      status :1,
      // validupto: {
      //   [Op.gte]: newDate
      // },
      offerType:'overall'
    
    } 

      if(params.discount && params.discount!="")
    {  where.discount=params.discount
      reqParam=true
    }

    var findData = await COMPANY.findAll({
      attributes:[[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance'],'id','companyName','logo1','address1','startTime','endTime','rating',"tags",'totalOrders','totalOrders24'],
      where: {
        status: 1,
      role :2,
      deliveryType: { [Op.or]: [params.deliveryType,2]},  
      itemType: { [Op.or]: itemType},    
      }, 
      include:[{model:COUPAN,required:reqParam,attributes:['discount','code','validUpto'],
      where: where
      }
    ] ,
    order: [sequelize.col('distance'),['createdAt','desc']],
    offset: offset, limit: limit

    })

    
    var cartCompanyId=""

    var cartData = await CART.findOne({where :{ userId : req.id},
    include: [
      {model:SERVICES , attributes: ['categoryId']}
    ]});
    
   if(cartData && cartData.dataValues) 
      cartCompanyId=cartData.dataValues.companyId


      findData=JSON.parse(JSON.stringify(findData))
for(var k=0;k<findData.length;k++)
{
  findData[k].cartCompanyId=cartCompanyId

}
   if(findData.length>0)
   return responseHelper.post(res, appstrings.success,findData);
  
   else    return responseHelper.post(res, appstrings.no_record,null,204);


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

app.get('/detail', checkAuth,async (req, res, next) => {
  try{
    var params=req.query
   var id=params.companyId
  let responseNull=  commonMethods.checkParameterMissing([params.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    //Get All Categories
    var findData = await COMPANY.findOne({
      attributes:['id','companyName','logo1','address1','totalRatings','rating','deliveryType','startTime','endTime','latitude','longitude',
    'foodQuantityRating','foodQualityRating','packingPresRating'],
      include:[{model:DOCUMENT,attributes:['aboutUsLink','aboutUs','privacyLink','termsLink','websiteLink',
    'facebookLink','instaLink','twitterLink','gmailLink','linkedinLink']}],
     where:{id:id}
  
    })

    
   
  
   if(findData)
   return responseHelper.post(res, appstrings.success,findData);
  
   else    return responseHelper.post(res, appstrings.no_record,null,204);


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

app.post('/gallery',checkAuth, async (req, res, next) => {
  try {
  
    var params=req.body

    let responseNull=  commonMethods.checkParameterMissing([params.companyId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
    var page =1
    var limit =20
    var mediaType=""

  

   if(params.mediaType) mediaType=params.mediaType
   if(params.page) page=params.page
 
   if(params.limit)
    limit=parseInt(params.limit)
    var offset=(page-1)*limit
 


    var where= {
      companyId:params.companyId,
      status:  1

      } 
     
 

  
   if(mediaType!="")
   where.mediaType=mediaType


      var findData = await GALLERY.findAll({
        attributes:['id','mediaHttpUrl','mediaType','createdAt'],
        where :where,
        offset: offset, limit: limit ,
        order: [['createdAt','DESC']]

      });
  
    if(findData.length>0) return responseHelper.post(res, appstrings.success, findData);
  else   return responseHelper.post(res, appstrings.no_record, null,204);

  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



app.post('/gallery/add',checkAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.companyId,data.mediaType])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    var imagesAvailable=0


    var upload=[]
    //console.log(">>>>>>>>>>>>>>>>",req.files['productImages#'+datatoUpdated[h].serviceId])
          if(req.files && req.files['media'])
          {
    var fdata=req.files['media']
    if(fdata.length && fdata.length>0)
    {imagesAvailable=1;
    
    for(var k=0;k<fdata.length;k++)
      {
    
           ImageFile = req.files['media'][k];    
      
             bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
              upload.push(bannerImage)
               ImageFile.mv(config.UPLOAD_DIRECTORY +"gallery/"+ bannerImage, function (err) {
                  //upload file
                  if (err)
                  return responseHelper.error(res, err.meessage, 400);   
                });
      }
      
      
    }
    
    else{
      ImageFile = req.files['media'];    
    if(ImageFile)       imagesAvailable=1;

      bannerImage = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
       upload.push(bannerImage)
        ImageFile.mv(config.UPLOAD_DIRECTORY +"gallery/"+ bannerImage, function (err) {
           //upload file
           if (err)
           return responseHelper.error(res, err.meessage, 400);   
         });
    
      
    }
    
          }
  

    
      if(imagesAvailable==0)
      responseHelper.post(res, appstrings.no_meadia, null,400);


    const user = await GALLERY.findOne({
      attributes: ['id'],

      where: {
        title: (data.title)?data.title:"PDELICIOKXXX",
      }
    });



    if (!user) {
    
    var users=null
      for(var k=0;k<upload.length;k++)
      {
       users = await GALLERY.create({
        title: data.title,
        description: data.description,
        mediaType: data.mediaType,
        mediaUrl: upload[k],
        mediaHttpUrl: upload[k],
        companyId:data.companyId,
        status:0
       });

      }

      if (users) {
        responseHelper.post(res, appstrings.added_success, null,200);
      
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})






async function getEstimation(distance,companyId)
{

  var shipment =await SHIPMENT.findOne({where:{companyId:companyId}}) 

  reeUfreeUptoDistancepto=10
  extraDistanceCharges=10
  var shipmentCharges="0"

  if(shipment==null)
  return shipmentCharges+"#"+200


  else if(distance>parseFloat(shipment.dataValues.radius))
   return shipmentCharges+"#"+400


if(shipment && shipment.dataValues)
{
 freeUptoDistance=shipment.dataValues.freeUptoDistance
 extraDistanceCharges=shipment.dataValues.extraDistanceCharges


if(distance>freeUptoDistance)
{
var dd=(distance-freeUptoDistance)
//console.log(dd,extraDistanceCharges)
shipmentCharges=(dd*extraDistanceCharges).toFixed(2)
}

}
return shipmentCharges+"#"+200
}

app.post('/shipmentCharges',checkAuth,async (req, res) => {
  var params=req.body;
  
  var data1={}
  var shipmentCharges="0"
  
  let responseNull=  commonMethods.checkParameterMissing([params.addressId,params.companyId])
   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  try{
  
  
  
  var latLongRes=await  ADDRESS.findOne({where: {status: 1,id :params.addressId}}); 
  

 
  
  if(latLongRes)
  {
  
  var companyData=await commonMethods.getParentCompany(params.companyId)
  
    if(companyData && companyData.latitude)
    {
      var lat1=companyData.latitude
      var long1=companyData.longitude
      var lat2=latLongRes.dataValues.latitude
      var long2=latLongRes.dataValues.longitude
  
  var distance=await commonMethods.distance(lat1,long1,lat2,long2,"K")
 



  var data=  await getEstimation(distance,params.companyId)
  var checkRes=data.split("#")
  console.log(checkRes)
 if(checkRes[1]==200){
    shipmentCharges=checkRes[0]
    data1.shipment=shipmentCharges
  return responseHelper.post(res,appstrings.success,data1)}

  else  return responseHelper.post(res,appstrings.delivery_not_allowed,null,400);

    }
    else
      return responseHelper.post(res,appstrings.something_went_wrong,null,400);

    
  
  
  
  
}
  
  }
  
  
    
  
      
      catch (e) {
        return responseHelper.error(res, e.message, 400);
  
      }
  
  }),
  





module.exports = app;