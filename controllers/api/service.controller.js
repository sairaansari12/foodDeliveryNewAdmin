const express = require('express');
const app = express();
const db = require('../../db/db');
const config = require('config');
const Op = require('sequelize').Op;
const moment   = require('moment');
const c = require('config');
const Geo = require('geo-nearby');
var _=require('underscore')

//Relations
SERVICES.belongsTo(CATEGORY,{as: 'category',foreignKey: 'categoryId'})
SERVICES.belongsTo(COMPANY,{foreignKey: 'companyId'})

SERVICES.hasOne(FAVOURITES,{id: 'id'})
SERVICES.hasOne(CART,{serviceId: 'serviceId'})
COMPANY.hasMany(CATEGORY,{foreignKey: 'companyId'})
COUPAN.belongsTo(COMPANY,{foreignKey: 'companyId'})
SUBORDERS.belongsTo(ORDERS,{foreignKey: 'orderId'})
DEALS.belongsTo(COMPANY,{foreignKey: 'companyId'})
COMPANY.belongsTo(COUPAN,{foreignKey: 'offer'})

//Home API with cats and trending and banners

app.get('/getParentcategories', checkAuth,async (req, res, next) => {
    try{

      //Get All Categories
      const servicesData = await CATEGORY.findAll({
        attributes: ['id','name', 'icon','thumbnail','colorCode'],
        where: {
          status: 1,
          parentId :'0',
          id:  {[Op.not]: '0'},
      
               },
              
               
        order: [
          ['orderby','ASC']
        ],
      })

  

      //CART ITEMS CATEGORY
var cartCategoryType="",cartCategoryCompany=""
var cartData = await CART.findAll({where :{ userId : req.id},
include: [
  {model:SERVICES , attributes: ['categoryId']}
]});

for(var p=0;p<cartData.length;p++)
{
if(cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId!="")
{
var data=await CATEGORY.findOne({
  attributes: ['connectedCat','id','companyId'],
  where: {
    id: cartData[p].service.categoryId
  }});

  cartCategoryType=JSON.parse(JSON.stringify(data.dataValues.connectedCat).toString())
  cartCategoryCompany=data.dataValues.companyId

  break;

}

}



    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.parentCompany},
      order: [
        ['orderby','ASC']
      ], 
    })

   
    let userData = {}
    
    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType=cartCategoryType
    userData.cartCategoryCompany=cartCategoryCompany

    var currency =await commonMethods.getCurrency(req.companyId) 

    var links =await commonMethods.getLinks(req.parentCompany) 


    var termsLink="",aboutUsLink="",privacyLink=""
    if(links && links.dataValues) 
    { aboutUsLink=links.dataValues.aboutusLink
      privacyLink=links.dataValues.privacyLink
      termsLink=links.dataValues.termsLink

    }
   
      userData.aboutUsLink=aboutUsLink
      userData.privacyLink=privacyLink
      userData.termsLink=termsLink

    

    if(currency && currency.dataValues && currency.dataValues.currency) 
    userData.currency=currency.dataValues.currency
    else userData.currency=CURRENCY
        return responseHelper.post(res, appstrings.success,userData);

   //return responseHelper.post(res, appstrings.success,userData);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});

app.get('/getcategories', checkAuth,async (req, res, next) => {
  try{

    var category=req.query
    //Get All Categories
    const servicesData = await CATEGORY.findAll({
      attributes: ['id','name', 'icon','thumbnail','colorCode'],
      where: {
        status: 1,
        level :'1',
        companyId: req.companyId,
        parentId:category,
        id:  {[Op.not]: '0'},
    
             },
            
             
      order: [
        ['orderby','ASC']
      ],
    })

  
//CART ITEMS CATEGORY
var cartCategoryType=""
var cartData = await CART.findAll({where :{companyId: req.companyId, userId : req.id},
include: [
  {model:SERVICES , attributes: ['categoryId']}
]});

for(var p=0;p<cartData.length;p++)
{
if(cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId!="")
{
var data=await CATEGORY.findOne({
  attributes: ['connectedCat','id'],
  where: {
    id: cartData[p].service.categoryId
  }});

  cartCategoryType=JSON.parse(data.dataValues.connectedCat).toString()
  break;

}

}





    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.companyId},
      order: [
        ['orderby','ASC']
      ], 
    })

   
    let userData = {}
    
    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType=cartCategoryType
    var currency =await commonMethods.getCurrency(req.companyId) 
if(currency && currency.dataValues && currency.dataValues.currency) userData.currency=currency.dataValues.currency
else userData.currency=CURRENCY
    return responseHelper.post(res, appstrings.success,userData);

}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
    

});

app.get('/getSubcat', checkAuth,async (req, res, next) => {

  var params=req.query

  const category=params.category
  var params=req.query

  var dataItem=['0','1']

  if(params.itemType && params.itemType!="" && params.itemType!="2") dataItem=[params.itemType]
  


  var include=[]


    try{
      var services = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          parentId: category,
          status: 1,
          companyId:req.companyId

        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })


      var newDate = moment(new Date()).format("MM/DD/YYYY");
      const coupanData = await COUPAN.findAll({
        attributes: ['id','name','description','icon','thumbnail','code','discount','validupto'],
        where: {
          companyId: req.companyId,
          status :1,
          validupto: {
            [Op.gte]: newDate
          },
          categoryId:  {[Op.or]: ["",category]}
        }
      })


        //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.companyId},
      order: [
        ['orderby','ASC']
      ], 
    })


//COMPANY DETAIL

const company = await COMPANY.findOne({
  attributes: ['companyName','address1','email','countryCode','phoneNumber', 'rating','totalRatings','logo1','startTime','endTime','deliveryType','itemType',
  'foodQuantityRating','foodQualityRating','packingPresRating'

],
  where:{id :req.companyId},
  include:[{model:DOCUMENT,attributes:['aboutUs','aboutUsLink','facebookLink','gmailLink','twitterLink','linkedinLink']}]
  
})

      let userData = {}
      
      //Combining Data
      userData.offers = coupanData
      userData.subcat = services
      userData.banners = banners
      userData.details = company

      getTrending(category,dataItem,function(err,data)
      {

    if(data)       userData.trending = data
    else      userData.trending = []

    return responseHelper.post(res, appstrings.success, userData);

      })
    


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});


app.get('/home', checkAuth,async (req, res, next) => {

  var params=req.query
  
   var lat=0
   var lng=0
   var itemType=['0','1','2']
   if(params.itemType && params.itemType!="") itemType=[params.itemType,'2']

   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)


  let responseNull=  commonMethods.checkParameterMissing([params.deliveryType])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

 


    try{


//Deals

var userInfo=await commonMethods.getUserInfo(req.id)


var dob=new Date(userInfo.dob)
var anDate=new Date(userInfo.anniversaryDate)


var newBCond={}
var newACond={}


if (sameDay( dob, new Date()))
  newBCond= { 'dealName': { [Op.like]: '%' + 'birthday' + '%' }}
if(sameDay(anDate,new Date()))
 newBACond= { 'dealName': { [Op.like]: '%' + 'anniverary' + '%' }}


 var newDate = moment(new Date()).format("MM/DD/YYYY");
 const deals = await DEALS.findAll({
   attributes: ['id','dealName','description','thumbnail','code','discount'],
   include:[{model:COMPANY,attributes:['companyName','id']
 }],
   where: {
     status :1,

     [Op.or]: [
      {  validupto: {
        [Op.gte]: newDate
      }},
newACond,
newBCond,  
  ]
    
   },
   offset: 0, limit: 5,
 })


    
     //Offers
      var newDate = moment(new Date()).format("MM/DD/YYYY");
      const offers = await COUPAN.findAll({
        attributes: ['id','name','icon','thumbnail','code','discount','validupto','description'],
        include:[{model:COMPANY,attributes:['companyName','id'],where:{ deliveryType: { [Op.or]: [params.deliveryType,2]},
      }}],
        where: {
          status :1,
          companyId:req.parentCompany,
          validupto: {
            [Op.gte]: newDate
          }
        },
        offset: 0, limit: 5,
      })

     //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name','url'],
      where:{companyId :req.parentCompany},
      order: [
        ['orderby','ASC']
      ], 
      offset: 0, limit: 5

    })



     //Restro Offers
    const restOffers = await COUPAN.findAll({
      attributes: ['discount','name','thumbnail'],
      where:{offerType :'overall',
      status :1,
      validupto: {
        [Op.gte]: newDate
      }},
      group:['discount'],
      order: [
        ['discount','ASC']
      ], 
      offset: 0, limit: 5

    })



  //Vendors
  var vendors = await COMPANY.findAll({
    attributes:[[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance'],'id','companyName','logo1','address1','startTime','endTime','rating','tags','totalOrders','totalOrders24'],
    where: {
    status: 1,
    role :2,
    parentId :req.parentCompany,
    deliveryType: { [Op.or]: [params.deliveryType,2]},  
    itemType: { [Op.or]: itemType}},    
    include:[{model:COUPAN,required:false,attributes:['discount','code','validUpto'],
    where: {
      status :1,
      validupto: {
        [Op.gte]: newDate
      }
    }}
  ] ,
  
   order: sequelize.col('distance'),
    offset: 0, limit:30,
  })

  var companyIds=_.map(vendors, function(data){ return data.id; });

var dataVendor=vendors
if(dataVendor.length>8) 
dataVendor=dataVendor.slice(0, 8);
  var bestSeller= _.shuffle(dataVendor);


//Ratings and best seller
   
   

//bestSeller=shuffle(vendors);


    var topPicks=await getTopPicks(req,params.deliveryType,itemType)



      let userData = {}
      
      //Combining Data
      userData.deals = deals
      userData.offers = offers
      userData.banners = banners

      if(vendors.length>6) 
      vendors=vendors.slice(0, 6);

      userData.vendors = vendors
      userData.restOffers = restOffers

      
     // userData.banners = banners
      if(bestSeller.length>6) 
      bestSeller=bestSeller.slice(0, 6);
      userData.bestSeller = bestSeller
      userData.topPicks = topPicks

      var cartCompanyType=""
      var cartData = await CART.findOne({where :{userId : req.id},
        attributes: ['companyId']
     });
      if(cartData)
      cartCompanyType=cartData.companyId
     userData.cartCompanyType=cartCompanyType

//Recent order

var recentOrder = await ORDERS.findOne({
  attributes:['id','orderNo','progressStatus','totalOrderPrice'],
  where :{userId : req.id,progressStatus:[1,3,6,7,8,9,10]},
  include: [{model: ORDERSTATUS , attributes: ['statusName','status']}],
  order: [
    ['createdAt', 'DESC']],

  });


userData.recentOrder=recentOrder
      getTrendingDeliveryType(params.deliveryType,companyIds,itemType,function(err,data)
      {

    if(data) userData.trending = data
    else      userData.trending = []





    return responseHelper.post(res, appstrings.success, userData);
      })
    


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});

// app.get('/nearby', checkAuth,async (req, res, next) => {

//   var params=req.query
//   let responseNull=  commonMethods.checkParameterMissing([params.deliveryType])
//   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


//     try{





//       var newDate = moment(new Date()).format("MM/DD/YYYY");


//       var lat = parseFloat(params.lat);
//       var lng = parseFloat(params.lng);
  
//       // var location = sequelize.literal(`ST_GeomFromText('POINT(${lng} ${lat})')`);
//       // var distance = sequelize.fn('ST_Distance_Sphere', sequelize.literal('geolocation'), location);
      



//     //Vendors
//     var vendors = await COMPANY.findAll({
//       attributes:[[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance'],'id','companyName','logo1','address1','startTime','endTime','rating'],
//       where: {
//       status: 1,
//       role :2,
//       parentId :req.parentCompany,
//       deliveryType: { [Op.or]: [params.deliveryType,2]}},   
//       include:[{model:COUPAN,required:false,attributes:['discount','code','validUpto'],
//       where: {
//         status :1,
//         validupto: {
//           [Op.gte]: newDate
//         }
//       }}
//     ] ,
    
//      order: sequelize.col('distance'),
//       offset: 0, limit:30,
//     })

//     var companyIds=_.map(vendors, function(data){ return data.id; });



//     const offers = await COUPAN.findAll({
//       attributes: ['id','name','description','icon','thumbnail','code','discount','validupto'],
//       include:[
//         {model:COMPANY,
//           attributes:['companyName','id'],where:{ deliveryType: { [Op.or]: [params.deliveryType,2]},
//     }
//   }],
//       where: {
//         status :1,
//         companyId:req.parentCompany,
//         validupto: {
//           [Op.gte]: newDate
//         },

//       },
//       offset: 0, limit: 5,
//     })




// //Ratings and best seller
//     var bestSeller=[];
//     if(vendors) 
//     {
//       //vendors=JSON.parse(JSON.stringify(vendors))

// // for(var k=0;k<vendors.length;k++)
// //       {
// //         var ratingArray=[4,3.5,4,4.5]
// //         var ratRandom = Math.floor(Math.random() * ratingArray.length);
// // var rating=ratingArray[ratRandom]
// // var dataRating=await commonMethods.getCompAvgRating(vendors[k].id)
// // if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
// // rating=dataRating.dataValues.totalRating

// // vendors[k].rating=rating

// // var idx = Math.floor(Math.random() * vendors.length);
// // if(!bestSeller.includes(vendors[idx])) bestSeller.push(vendors[idx]);



// //       }

//     }






//       let userData = {}
      
//       //Combining Data
//       userData.vendors = vendors
//       userData.offers = offers



     
//     return responseHelper.post(res, appstrings.success, userData);
     
    


//     }
//     catch (e) {
//       return responseHelper.error(res, e.message, 400);
//     }

// });



app.get('/getServices', checkAuth,async (req, res, next) => {

var params=req.query
var page =1
var limit =20
var categoryId=params.category

var dataItem=['0','1']

if(params.itemType && params.itemType!="" && params.itemType!="2") dataItem=[params.itemType]



if(params.page) page=params.page
if(params.limit) limit=parseInt(params.limit)
var offset=(page-1)*limit
var catArray=[categoryId]
  var include=[]

 
   include=[ {
      model: CATEGORY,
      as: 'category',
      attributes: ['id','name','icon','thumbnail'],
      required: true
    },
  
    {
      model: FAVOURITES,
      where: {
        'userId':  req.id,

      },
      attributes:['id'],
      required: false,
                },

   {
      model: CART,
       where: {
      'userId':  req.id,
   },
    attributes:['id','quantity','orderPrice','orderTotalPrice'],
   required: false,
   }  


  
  ]
  
    try{


      var catDta = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail'],
        where: {
          parentId: categoryId,
          status: 1
        },
        order: [
          ['orderby','ASC']
        ],
      })

      for(var p=0;p<catDta.length;p++)
      {
        catArray.push(catDta[p].id)
      }

      var services = await SERVICES.findAll({
        attributes: ['id','name','description','productType','price','icon','thumbnail','type','price','duration','includedServices','excludedServices','originalPrice','offer','offerName','validUpto','itemType'],
        where: {
          categoryId:  {[Op.or]: catArray},   
                 status: 1,
                 itemType:  {[Op.or]: dataItem} 

        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
        offset:offset,limit:limit
      })

      services=JSON.parse(JSON.stringify(services))
for(var p=0;p<services.length;p++)
{

  //  if(services[p].cart) services[p].cart=services[p].cart.id
  //  else services[p].cart=""

   if(services[p].favourite) services[p].favourite=services[p].favourite.id
   else services[p].favourite=''

   if(services[p].offer >0 && (new Date(services[p].validUpto) < new Date()))
   {
     services[p].price=parseFloat(services[p].originalPrice)
   services[p].offer=0}

}

  let dataSend={};
  dataSend.services=services
  dataSend.headers=catDta
 return responseHelper.post(res, appstrings.success, dataSend);
 


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

});
 

app.post('/search', checkAuth,async (req, res, next) => {

  var params=req.body

  var search=params.search
  var type=params.type
  let responseNull=  commonMethods.checkParameterMissing([search])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

  var page =1
  var limit =20
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)
   var offset=(page-1)*limit

   
   var lat=0
   var lng=0
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)

  
   
     var include=[ {
        model: CATEGORY,
        as: 'category',
        attributes: ['id','name','icon','thumbnail'],
        required: true
      },
    
      {
        model: FAVOURITES,
        where: {
          'userId':  req.id,
  
        },
        attributes:['id'],
        required: false,
                  },


     
                  {
                    model: COMPANY,
                    where: {
                      deliveryType: { [Op.or]: [params.deliveryType,2]},   
                    },
                    attributes:['id','companyName','rating'],
                    required: true,
                              },             
  




     {
        model: CART,
         where: {
        'userId':  req.id,
     },
      attributes:['id'],
     required: false,
     }  
  
  
    
    ]
    
      try{
  var services=[];
  if(type=='food')
  {
       services = await SERVICES.findAll({
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','includedServices','excludedServices','originalPrice','offer','offerName','validUpto','itemType'],
          where: {
            name: { [Op.like]: '%' + search + '%' },
            status: 1
          },
          include: include,
          order: [
            ['orderby','ASC']
          ],
          offset: offset, limit:limit,

        })
  
   services=JSON.parse(JSON.stringify(services))
  for(var p=0;p<services.length;p++)
  {
  
     if(services[p].cart) services[p].cart=services[p].cart.id
     else services[p].cart=""
  
     if(services[p].favourite) services[p].favourite=services[p].favourite.id
     else services[p].favourite=''
  
     if(services[p].offer >0 && (new Date(services[p].validUpto) < new Date()))
     {services[p].price=parseFloat(services[p].originalPrice)
     services[p].offer=0}
  
  }


}


else{
 //Vendors
 var newDate = moment(new Date()).format("MM/DD/YYYY");
  services = await COMPANY.findAll({
  attributes:[[sequelize.literal("6371 * acos(cos(radians("+lat+")) * cos(radians(latitude)) * cos(radians("+lng+") - radians(longitude)) + sin(radians("+lat+")) * sin(radians(latitude)))"),'distance'],'id','companyName','logo1','address1','startTime','endTime','rating'],
  where: {
  status: 1,
  role :2,
  parentId :req.parentCompany,
  companyName: { [Op.like]: '%' + search + '%' },
  deliveryType: { [Op.or]: [params.deliveryType,2]}},   
  include:[{model:COUPAN,required:false,attributes:['discount','code','validUpto'],
  where: {
    status :1,
    validupto: {
      [Op.gte]: newDate
    }
  }}
] ,
order: sequelize.col('distance'),
offset: offset, limit:limit,
})


}

  
    let dataSend={};
    dataSend.services=services
   return responseHelper.post(res, appstrings.success, dataSend);
   
  
  
      }
      catch (e) {
        return responseHelper.error(res, e.message, 400);
      }
  
  });



  app.get('/detail', checkAuth,async (req, res, next) => {
    var id =req.query.serviceId
    let responseNull=  commonMethods.checkParameterMissing([id])
     if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
        try{
          var services = await SERVICES.findOne({
            attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','includedServices','excludedServices','rating','originalPrice','offer','offerName','itemType'],
            where: {
              id: id,
              status: 1
            },
    
            include :[{
              model: FAVOURITES,
              where: {
                'userId':  req.id,
        
              },
              attributes:['id'],
              required: false,
                        },
        
           {
              model: CART,
               where: {
              'userId':  req.id,
           },
            attributes:['id'],
           required: false,
           } ,
           {
            model: CATEGORY,
            as: 'category',
            attributes: ['id','name','icon','thumbnail'],
            required: true
          },
          
          
          
          
          ],
    
    
            order: [
              ['orderby','ASC']
            ],
          })
          if(services) 
          {
    
          services=JSON.parse(JSON.stringify(services))
        
           var rating =0
           
            if(services.cart) services.cart=services.cart.id
            else services.cart=""
    
            if(services.favourite) services.favourite=services.favourite.id
            else services.favourite=''
            // services['category']=null
          
          
    
    
        return responseHelper.post(res, appstrings.success, services);
    
          }
         else return responseHelper.post(res,appstrings.no_record,null,204);
    
        }
        catch (e) {
          return responseHelper.error(res, e.message, 400);
        }
    
    });
    




async function getTrending(CAT,dataItem,callback)
{
var where={}
  if(CAT!="")
where.connectedCat= {
  [Op.like]: '%'+ CAT + '%'

}

  try{
  
  var services = await SERVICES.findAll({
    attributes: ['id','name','productType','popularity','description','icon','thumbnail','categoryId','itemType'],
    where: {
      status: 1,
      itemType: { [Op.or]: dataItem}, 
      productType:1
    },
            include: [ {
            model: CATEGORY,
            as: 'category',
            attributes: ['name','id'],
            required: true,
            where:where
                       
          }],
          order:[['popularity','DESC']],
          offset: 0, limit: 10,  

  })

    if(services)  callback(null, services);
else  callback(appstrings.oops_something, services)
  
  }

  catch(e)
  {
console.log(e)
    callback(e.message, null);

  }



}




async function getTrendingDeliveryType(deliveryType,companyIds,itemType,callback)
{

var dataItem=['0','1']
if(itemType!="" && itemType!="2") dataItem=[itemType]


  try{

    var services = await SERVICES.findAll({
      attributes: ['id','name','description','popularity','icon','thumbnail','categoryId','rating','itemType'],
      where: {
        status: 1,
        itemType:itemType
      },
      include:[
        {model:COMPANY,attributes:['id'],required:true,
        where:{ deliveryType: { [Op.or]: [deliveryType,2]},
        id: { [Op.or]: companyIds},
       }},
      
       {
                      model: CATEGORY,
                      as: 'category',
                      attributes: ['name','id'],
                      required: true
       }
      
      ],
            order:[['popularity','DESC']],
            offset: 0, limit: 10,  
           

    })

    if(services)  callback(null, services);
else  callback(appstrings.oops_something, services)
  
  }

  catch(e)
  {
console.log(e)
    callback(e.message, null);

  }



}

// async function getTrendingDeliveryType(deliveryType,companyIds,itemType,callback)
// {
// var where={}

// var dataItem=['0','1']
// if(itemType!="" && itemType!="2") dataItem=[itemType]


//   try{
  
//   var countDataq = await SUBORDERS.findAll({
//     attributes: ["id","serviceId",[sequelize.fn("COUNT", sequelize.col("serviceId")), "count"]] , 
//     group: ['serviceId'],
//     include:[
//       {model:ORDERS,attributes:['id'],required:true,
//      include:[
//        {model:COMPANY,attributes:['id'],required:true,
//        where:{ deliveryType: { [Op.or]: [deliveryType,2]},
//        id: { [Op.or]: companyIds},
//       }}]
//      },
//      {model:SERVICES,attributes:['itemType'],required:true,
//      where:{ 
//       itemType: { [Op.or]: dataItem},
//      productType:1
//     }}
//     ],
//     order: [[sequelize.literal('count'), 'DESC']],
//     offset: 0, limit: 10,  
// });

// var serviceArray=[]
// for(var k=0;k<countDataq.length;k++)
//     {
//       serviceArray.push(countDataq[k].serviceId)
//     }




//     if(serviceArray.length==0)
//     callback(null, services);

//   else{  var services = await SERVICES.findAll({
//       attributes: ['id','name','description','icon','thumbnail','categoryId','rating','itemType'],
//       where: {
//         id:  {[Op.or]: serviceArray},
//         status: 1
//       },
//               include: [ {
//               model: CATEGORY,
//               as: 'category',
//               attributes: ['name','id'],
//               required: true,
//               where:where
                         
             
          
//             }],
//             offset: 0, limit: 10,  

//     })

//     if(services)  callback(null, services);
// else  callback(appstrings.oops_something, services)
//   }
//   }

//   catch(e)
//   {
// console.log(e)
//     callback(e.message, null);

//   }



// }


async function getTopPicks(req,deliveryType,itemType)
{


  try{ 
  
  var countDataq = await ORDERS.findAll({
    attributes: ["id","companyId",[sequelize.fn("COUNT", sequelize.col("companyId")), "count"]] , 
    group: ['companyId'],
    where:{userId:req.id},
    include:[{model:COMPANY,
      attributes:['id'],
      where:{ deliveryType: { [Op.or]: [deliveryType,2]},
      itemType: { [Op.or]: itemType}
  
    }
    }
  ],

    order: [[sequelize.literal('count'), 'DESC']],
    offset: 0, limit: 5,  
});

var companyArray=[]
for(var k=0;k<countDataq.length;k++)
    {
      companyArray.push(countDataq[k].companyId)
    }


    var where= {
      status: 1,
      role :2,
      parentId :req.parentCompany
      }
if(companyArray && companyArray.length>0)
where.id= {[Op.or]: companyArray}
else return [];
    





    var vendors = await COMPANY.findAll({
      attributes:['id','companyName','logo1','address1','rating'],
      where:where,    
      offset: 0, limit: 5,
    })





   return vendors;

  }

  catch(e)
  {
    console.log(e)
    return [];

  }



}




function sameDay( d1, d2 ){
  return  d1.getUTCMonth() == d2.getUTCMonth() &&
         d1.getUTCDate() == d2.getUTCDate();
}


module.exports = app;