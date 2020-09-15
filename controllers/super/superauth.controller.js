
const express = require('express');
const app     = express();
const hashPassword = require('../../helpers/hashPassword');
const COMPANY= db.models.companies
const Op = require('sequelize').Op;
const jwt = require('jsonwebtoken');

function isAdminAuth(req, res, next) {
    // if(req.session.userData){
    //   return next();
    // }
    // return res.redirect('/company');

    return next();
  }
/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/
app.get('/', async (req, res, next) => {
    if(req.session.userData){
        const findData = await COMPANY.findAll({
        where :{parentId :req.session.companyId},
        order: [
          ['companyName','ASC']
        ],      

        });
        var usersCount= await USERS.findOne({
          attributes: ['status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']]
           
        });

        var ordersCount= await ORDERS.findOne({
          attributes: ['progressStatus',
            [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
            [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']]
           
        });
        
        
       //var data=await  getDashboardData("2020-04-10","2020-04-17",null,null,req.session.companyId)
        return res.render(superadminfilepath+'dashboard/dashboard.ejs',{data:null,findData,ordersCount,usersCount,avgRating:req.session.avgRating});

    }

    return res.render(superadminfilepath+'dashboard/login.ejs');
});


app.get('/login', async (req, res, next) => {
  
  return res.render(superadminfilepath+'dashboard/login.ejs');
});

async function getDashboardData(fromDate1,toDate1,progressStatus1,filterName,companyId,parentCompany)
{
    try {
        var fromDate =  ""
        var toDate =  ""
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);


        var filterNameMain=[sequelize.literal(`DAY(createdAt)`), 'DAY']
        var pStatus= await ORDERSTATUS.findAll({
          where: {
            companyId:parentCompany
          }}
          );
        progressStatus = pStatus.map(user => user.status);
        if(progressStatus1 && progressStatus1!="")  progressStatus=[progressStatus1]
       
        orderWhere={companyId: companyId,progressStatus: { [Op.or]: progressStatus}}
        orderWhereParent={progressStatus: { [Op.or]: progressStatus}}

       
       
        if(filterName && filterName!="")
        {
          if(filterName=="MONTH")  filterNameMain= [sequelize.literal(`MONTH(createdAt)`), 'MONTH']
          if(filterName=="YEAR")  filterNameMain= [sequelize.literal(`YEAR(createdAt)`), 'YEAR']
          if(filterName=="WEEK")  {
            
            filterNameMain= [sequelize.literal(`WEEK(createdAt)`), 'WEEK']
            orderWhere={companyId: companyId,
              progressStatus: { [Op.or]: progressStatus},
              createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
            }
            orderWhereParent={
              progressStatus: { [Op.or]: progressStatus},
              createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
            }

        }

        if(filterName=="DAY")  {
            
          filterNameMain= [sequelize.literal(`DAY(createdAt)`), 'DAY']
          orderWhere={companyId: companyId,
            progressStatus: { [Op.or]: progressStatus},
            createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
          }

          orderWhereParent={
            progressStatus: { [Op.or]: progressStatus},
            createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay}
          }


      }
        }



        paymentWhere={companyId: companyId,transactionStatus: { [Op.or]: progressStatus}}
        ratingWhere={companyId: companyId}
        top5Where={}

        
       
        if(fromDate1)fromDate= Math.round(new Date(fromDate1).getTime())
        if(toDate1) toDate=Math.round(new Date(toDate1).getTime())
        
      
      if(fromDate1!="" && toDate1!="")
      {
        
        orderWhere={companyId: companyId,progressStatus: { [Op.or]: progressStatus},createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        orderWhereParent={progressStatus: { [Op.or]: progressStatus},createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        top5Where={createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        paymentWhere={companyId: companyId,createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}
        ratingWhere={companyId: companyId,createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate}}

    
      }

      var ordersDataqDepth = await ORDERS.findAll({
        attributes: ['progressStatus','createdAt',
          [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
          filterNameMain,
          [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']],
          group: [filterNameMain],
           where :orderWhere
      });

         

          var ordersDataqDepthParent = await ORDERS.findAll({
            attributes: ['progressStatus','createdAt',
              [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
              filterNameMain,
              [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count']],
              group: [filterNameMain],
               where :orderWhereParent
          });
    

          var top5UserStat= await ORDERS.findAll({
            attributes: ['userId','orderNo',
              [sequelize.fn('SUM', sequelize.col('totalOrderPrice')), 'totalSum'],
              [sequelize.fn('COUNT', sequelize.col('userId')), 'count']],
              include:[{model:USER,required:true,attributes:['firstName','lastName','image','createdAt','countryCode','phoneNumber',]},
            {model:COMPANY,attributes:['companyName']}
            
            ],
              where :top5Where,
              group: ['userId'],
              order:[[sequelize.literal('count'),'DESC']],
              limit:5, offset:0
          });
          
      
          var ratings= await COMPANYRATING.findOne({
            attributes: ['rating',
              [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
              [sequelize.fn('COUNT', sequelize.col('rating')), 'count']],
              where:ratingWhere
          });
          var paymentDataqdepth = await PAYMENT.findAll({
            attributes: ['paymentState',
              [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
              [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count']],
            group: ['paymentState'],
            where :{companyId: companyId,createdAt: { [Op.lte]: lastDay,[Op.gt]: firstDay   }}});

          // var userDataqDepth = await USER.findAll({
          //   attributes: ['id','status',
          //   filterNameMain,
          //     [sequelize.fn('COUNT', sequelize.col('status')), 'count'],[sequelize.literal(`WEEK(createdAt)`), 'week'],
          //   ],
          //      group:['status',filterNameMain],
          //     where :userWhere});


          //targetSales

          var targetSales = await DOCUMENT.findOne({
            attributes: ['targetSales'],
             where :{companyId:companyId}});

          var productStat = await SERVICES.findOne({
            attributes: ['id',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          where :ratingWhere});



//RatingsDatat

  var dataRating=await commonMethods.getCompAvgRating(companyId) 
  var ratingsData={}
  var rating = '0';
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {
    rating=dataRating.dataValues.totalRating
  }
  foodQuality=dataRating.dataValues.foodQuality
  packingPres=dataRating.dataValues.packingPres
  foodQuantity=dataRating.dataValues.foodQuantity
  ratingsData.avgRating=rating
  ratingsData.foodQuality=foodQuality
  ratingsData.packingPres=packingPres
  ratingsData.foodQuantity=foodQuantity
    var userDtaa={}
    userDtaa.revenuAnalytics=ordersDataqDepth
    userDtaa.revenuAnalyticsParent=ordersDataqDepthParent
    userDtaa.top5UserStat=top5UserStat
    userDtaa.ratingStat=ratings
    userDtaa.productStat=productStat
    userDtaa.paymentStat=paymentDataqdepth;
    if(targetSales)
    {
       userDtaa.targetSales=targetSales
     }else{
       userDtaa.targetSales= 0
     }
   
    userDtaa.ratingsData=ratingsData   
   
    
    
    

    
          return  userDtaa
      
        } catch (e) {
          console.log(e)
          return null
         // return responseHelper.error(res, e.message, 400);
        }
      

}

app.get('/chat',superAuth, async (req, res, next) => {

  const credentials = {
    phoneNumber: req.session.userData.phoneNumber,
    companyId:   req.companyId,
    countryCode: req.session.userData.countryCode,
    userType: req.session.userData.type,
    id : req.session.userData.id
  };
  const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });  
    return res.render('super/chat/chat.ejs',{ token: authToken, id: req.id});
});


app.get('/chatAdmin',superAuth, async (req, res, next) => {

  return res.render('super/chat/chatAdmin.ejs',{ token: req.token, id: req.id});
});

/**
*@role Admin Login
*@Method POST
*@author Saira Ansari
*/



app.post('/dashboard', superAuth,async (req, res, next) => {
  try{
    var params=req.body;
    var cc = params.cid;
    var data=await getDashboardData(params.fromDate,params.toDate,null,params.filterName,cc,req.id)
    return responseHelper.post(res, appstrings.success,data,200);
  }
  catch(e)
  {
    return responseHelper.error(res, e.message);

  }
  
});
app.post('/login',async(req,res,next) => { 
  
    var params=req.body
        try{
            		const userData = await COMPANY.findOne({
            		where: {
                  email: params.email,
                  role:1,
                  status:1
            		}
                })  
                
                if(userData)
               {
                
                console.log(params.password,await hashPassword.generatePass(params.password));

               
                const match = await hashPassword.comparePass(params.password,userData.dataValues.password);
        
                if (!match) {
                    req.flash('errorMessage',appstrings.invalid_cred)
                     return res.redirect(superadminpath);
                }
                      
                
                var parentCompany=""
                var parent=await commonMethods.getParentCompany(userData.dataValues.id)
                if(parent && parent.dataValues)parentCompany=parent.dataValues.parentId
                req.session.userData = userData;
                req.session.role = 1;
                req.session.companyId = userData.dataValues.id;
                req.session.userId = userData.dataValues.id;
                req.session.parentCompany = parentCompany;
                req.session.avgRating = userData.dataValues.rating;

                var currency =await commonMethods.getCurrency(userData.dataValues.id) 
                if(currency && currency.dataValues && currency.dataValues.currency) CURRENCY=currency.dataValues.currency
                 
                req.flash('successMessage',"Welcome, you are logged in successfully.");
                return res.redirect(superadminpath);

                }  
                else    
                {  
                    req.flash('errorMessage',appstrings.invalid_cred);

                    return res.redirect(superadminpath);

                }
 
                       
    }catch (e) {
            req.flash('errorMessage',e.message);
            return res.redirect(superadminpath);

    //  return responseHelper.error(res, e.message, 400);
    }
});

/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/


/**
*@role Admin Dashboard
*@Method POST
*@author Saira Ansari
*/
app.get('/logout',async(req,res,next) => {
    req.session.destroy((err) => {
    if(err) {
        return console.log(err);
    }
   // req.flash('successMessage',"Logout Success.");
    //return res.redirect(superadminpath);
    return res.render(superadminfilepath+'dashboard/logout.ejs');

    });
});


app.post('/forgotPassword',async(req,res,next) => { 
  
  
  var params=req.body
  let responseNull= commonMethods.checkParameterMissing([params.email])

  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

      try{
             userData = await COMPANY.findOne({
            where: {
                email: params.email,
              }
              })  
                
              if(userData)
             {

              
                userData= JSON.parse(JSON.stringify(userData))


                  var number= Math.floor(Math.random()*(10000000-0+1)+10000000 )+"";
                  const newPassword = await hashPassword.generatePass(number);
                 var dataEmail={name: userData.companyName,password: number,app_name:config.APP_NAME}
                  commonNotification.sendForgotPasswordMail(userData.email,dataEmail)
                  await COMPANY.update({ password: newPassword}, {where: { id: userData.id}}) ;

              //  return responseHelper.post(res,
              //    appstrings.password_reset_success,
              //    null,200, )}  
              // else    
              // {  
              //     return responseHelper.post(res, appstrings.no_record,null,204);
              // }

              req.flash('successMessage',userData.email);
              return res.redirect(superadminpath+"recoverPassword");
            }  
              else    
              {  
                  req.flash('errorMessage',appstrings.no_record);
                  return res.redirect(superadminpath+"forgotPassword");
              }


                     
  }catch (e) {
      console.log(e)
        return responseHelper.error(res, e.message);

  //  return responseHelper.error(res, e.message, 400);
  }
});


app.post('/changePassword',superAuth,async(req,res,next) => { 
  
    var params=req.body
    let responseNull= commonMethods.checkParameterMissing([params.oldPassword,params.newPassword])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

        try{
            	const userData = await COMPANY.findOne({
            	where: {
                  id: req.id,
            		}
            	  })  
                  
                if(userData)
               {
                
                const match = await hashPassword.comparePass(params.oldPassword,userData.dataValues.password);
        
                if (!match) {
                 return responseHelper.post(res, appstrings.inccorect_oldpass,null,400);

                }
                     
                else{

                    const newPassword = await hashPassword.generatePass(params.newPassword);
                    await COMPANY.update({ password: newPassword}, {where: { id: req.id}}) ; 
                    return responseHelper.post(res, appstrings.password_change_success,null,200);


                }
               

                }  
                else    
                {  
                    return responseHelper.post(res, appstrings.no_record,null,204);


                }
 
                       
    }catch (e) {
        console.log(e)
          return responseHelper.error(res, e.message);

    //  return responseHelper.error(res, e.message, 400);
    }
});

app.get('/changePassword',superAuth, async (req, res, next) => {
   return res.render(superadminfilepath+'dashboard/changePassword.ejs');
});

app.get('/recoverPassword', async (req, res, next) => {
  return res.render(superadminfilepath+'dashboard/recoverPassword.ejs');
});

app.get('/forgotPassword', async (req, res, next) => {
  return res.render(superadminfilepath+'dashboard/forgotPassword.ejs');
});

app.get('/dashboard', async (req, res, next) => {
  const findData = await COMPANY.findAll({
        where :{parentId :req.id},
        order: [
          ['companyName','ASC']
        ],      

        });
  return res.render(superadminfilepath+'dashboard/dashboard.ejs',{findData});
});

/*
*@role Get Top Restaurants
*/
app.get('/getToprestaurants', superAuth,async (req, res, next) => {
  var companyId = req.id;
  //Rating Basis
  var toprating = await COMPANY.findAll({
      attributes: ['companyName','rating'],
      where :{parentId :req.id},
      order: [
        ['rating', 'DESC'],
      ],
      limit: 5
  });
  var labels = [];
  var ratedata = [];
  for (var i = 0; i < toprating.length; i++) {
    labels.push(toprating[i].companyName);
    if(toprating[i].rating == "")
    {
      ratedata.push('0');
    }else{
      ratedata.push(toprating[i].rating);
    }
  }
  var MainRate = {};
  MainRate.labels = labels;
  MainRate.ratedata = ratedata;

  //Orders Basis
  var toporders = await COMPANY.findAll({
      attributes: ['companyName','totalOrders'],
      where :{parentId :req.id},
      order: [
        ['totalOrders', 'DESC'],
      ],
      limit: 5
  });

  var olabels = [];
  var oratedata = [];
  for (var i = 0; i < toporders.length; i++) {
    olabels.push(toporders[i].companyName);
    if(toporders[i].totalOrders == "")
    {
      oratedata.push('0');
    }else{
      oratedata.push(toporders[i].totalOrders);
    }
  }
  var MainOrder = {};
  MainOrder.labels = olabels;
  MainOrder.ratedata = oratedata;
 
  const data  = {};
  data.topr   = toprating;
  data.topo   = toporders;
  data.rating = MainRate;
  data.orders = MainOrder;

  return responseHelper.post(res, appstrings.success,data,200);
});

/*
*@role Get Bottom Restaurants
*/
app.get('/getbottomrestaurants', superAuth,async (req, res, next) => {
  var companyId = req.id;
  //Rating Basis
  var toprating = await COMPANY.findAll({
      attributes: ['companyName','rating'],
      where :{parentId :req.id},
      order: [
        ['rating', 'ASC'],
      ],
      limit: 5
  });
  var labels = [];
  var ratedata = [];
  for (var i = 0; i < toprating.length; i++) {
    labels.push(toprating[i].companyName);
    if(toprating[i].rating == "")
    {
      ratedata.push('0');
    }else{
      ratedata.push(toprating[i].rating);
    }
  }
  var MainRate = {};
  MainRate.labels = labels;
  MainRate.ratedata = ratedata;
  //Orders Basis
  var toporders = await COMPANY.findAll({
      attributes: ['companyName','totalOrders'],
      where :{parentId :req.id},
      order: [
        ['totalOrders', 'ASC'],
      ],
      limit: 5
  });
  var olabels = [];
  var oratedata = [];
  for (var i = 0; i < toporders.length; i++) {
    olabels.push(toporders[i].companyName);
    if(toporders[i].totalOrders == "")
    {
      oratedata.push('0');
    }else{
      oratedata.push(toporders[i].totalOrders);
    }
  }
  var MainOrder = {};
  MainOrder.labels = olabels;
  MainOrder.ratedata = oratedata;

  const data ={};
  data.topr = toprating;
  data.topo = toporders;
  data.rating = MainRate;
  data.orders = MainOrder;
  return responseHelper.post(res, appstrings.success,data,200);
});

/*
*@role Get Bottom Restaurants
*/
app.get('/getbottomrestaurants', superAuth,async (req, res, next) => {
  var companyId = req.id;
  //Rating Basis
  var toprating = await COMPANY.findAll({
      attributes: ['companyName','rating'],
      where :{parentId :req.id},
      order: [
        ['rating', 'ASC'],
      ],
      limit: 5
  });
  //Orders Basis
  var toporders = await COMPANY.findAll({
      attributes: ['companyName','totalOrders'],
      where :{parentId :req.id},
      order: [
        ['totalOrders', 'ASC'],
      ],
      limit: 5
  });
  const data ={};
   data.topr = toprating;
  data.topo = toporders;

  return responseHelper.post(res, appstrings.success,data,200);
});


/*
*@role Get Bottom Restaurants
*/
app.get('/getrevenue', superAuth,async (req, res, next) => {
  var companyId = req.id;
  //Rating Basis
  var toprating = await COMPANY.findAll({
    attributes: ['id','companyName','rating','totalOrders'],
    where :{
      parentId :req.id
    },
  });
  var main    = [];
  var NameC   = [];
  var ratingC = [];
  for (var i = 0; i < toprating.length; i++) {
    var id = toprating[i].id;
    var ordersDataqDepthFull= await ORDERS.findOne({
      attributes: ['progressStatus',
        [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum']],
        where :{
          companyId: id,
          progressStatus: '5'
        },
    });
    if(ordersDataqDepthFull)
    {
      ratingC.push(toprating[i].totalOrders)
      NameC.push(toprating[i].companyName)
      if(ordersDataqDepthFull.dataValues.totalSum == null)
      {
        main.push('0');
      }else{
        main.push(ordersDataqDepthFull.dataValues.totalSum);
      }
    }
  }
  var data      = {};
  data.name     = NameC;
  data.orders   = ratingC;
  data.totalSum = main;
  //console.log(main);
  return responseHelper.post(res, appstrings.success,data,200);
});

/*
*@role Get Bottom Restaurants
*/
app.post('/compareRestaurants',async (req, res, next) => {
  var params=req.body;
  var toprating = await COMPANY.findAll({
    attributes: ['id','companyName','rating','totalOrders','startTime','endTime','deliveryType','totalOrders24','logo1','foodQuantityRating','foodQualityRating','packingPresRating'],
    where :{
      id :{
        [Op.in]: params.restaurantId
      }
    },
  });
  return responseHelper.post(res, appstrings.success,toprating,200);
});
module.exports = app;

//Edit User Profile
