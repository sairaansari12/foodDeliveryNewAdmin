const express = require('express');
const app = express();
const db = require('../../db/db');
const moment   = require('moment');

const Sequelize       = require('sequelize');
const Op             = require('sequelize').Op;
const COUPAN          = db.models.coupan;
const CART          = db.models.cart;


//////////////////////////////////////////////
///////////////////////// PromoCode Api //////
//////////////////////////////////////////////


//////////////////////////// Get Promo List API ////////////////
app.get('/getPromoList', checkAuth,async (req, res, next) => {
  try{
    var newDate = moment(new Date()).format("MM/DD/YYYY");
    const coupanData = await COUPAN.findAll({
      where: {
        status :1,
        validupto: {
          [Op.gte]: newDate
        },
        type:{[Op.in] :['0',req.userData.userType]}
      }
    })
    
    if(coupanData){

      var data=[];
for(var k=0;k<coupanData.length;k++)
{
      var orderData= await ORDERS.findAll({
        where: {
          promoCode: coupanData[k].code,
          userId :req.id
        }
      });

if(coupanData[k].usageLimit>0 && !(orderData && orderData.length>0 && orderData.length>=parseInt(coupanData[k].usageLimit)))
{
data.push(coupanData[k])

}
}

if(data.length>0) return responseHelper.post(res, appstrings.success,data)
    else
 return responseHelper.post(res, appstrings.no_record,null,204);

}
 else  return responseHelper.post(res, appstrings.no_record,null,204);

  }
  catch(e){
    return responseHelper.error(res, e.message, 400);
  }
});


///////// Add Coupan /////////////////////////
app.post('/applyCoupan', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    let companyId = req.companyId;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.promoCode])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  var newDate = moment(new Date()).format("MM/DD/YYYY");

    const coupanDetails = await COUPAN.findOne({
     attributes: ['id','code','discount','minimumAmount','usageLimit'],
      where: {
        code: data.promoCode,
        status :1,
        validupto: {
          [Op.gte]: newDate
        },
        type:{[Op.in] :['0',req.userData.userType]}


      }
    });
    if(coupanDetails)
    {

      var orderData= await ORDERS.findAll({
        where: {
          promoCode: data.promoCode,
          userId :req.id
        }
      });



if(orderData  && orderData.length>=coupanDetails.usageLimit)
return responseHelper.post(res, appstrings.exceeded_limit,null,400);


      //Cart Total Price
      const getcart = await CART.findOne({
       attributes: [[Sequelize.fn('sum', Sequelize.col('orderTotalPrice')), 'totalPrice']
      ],
        where: {
          userId: req.id
        }
      });

     

      if(parseFloat(getcart.dataValues.totalPrice)<parseFloat(coupanDetails.minimumAmount))
      {
        return responseHelper.post(res, appstrings.minimum_limit,null,400);

      }
      let price = parseFloat(getcart.dataValues.totalPrice);
      let per   = parseFloat(coupanDetails.dataValues.discount);
      let discount_price = (price/100)*per;        // Get Percentage Amount
      let payableAmount  = price - discount_price;  //Payable Amount
      
      
      await CART.update({
        promoCode: coupanDetails.dataValues.code
      },
      {where : {userId: req.id}});

      var response={}
      response.totalAmount=price
      response.discountPrice=discount_price
      response.payableAmount = payableAmount
      response.coupanId= coupanDetails.dataValues.id,
      response.coupanCode= coupanDetails.dataValues.code,
      response.coupanDiscount= coupanDetails.dataValues.discount
      return responseHelper.post(res, appstrings.coupan_applied,response);

  
    }
    else
    {

      return responseHelper.post(res, appstrings.invalid_coupan,null,400);

      
    }
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});




///////// Add Coupan /////////////////////////
app.post('/removeCoupan', checkAuth,async (req, res, next) => {
  try{
    const data    = req.body;
    //Get Coupan Details

    let responseNull=  commonMethods.checkParameterMissing([data.promoCode])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
    const coupanDetails = await COUPAN.findOne({
     attributes: ['id','code','discount'],
      where: {
        code: data.promoCode,
        status :1

      }
    });
    if(coupanDetails)
    {
      //Cart Total Price
      
      await CART.update({
        promoCode: ""
      },
      {where : {userId: req.id}});

     
      return responseHelper.post(res, appstrings.coupan_removed,null);

  
    }
    else
    {

      return responseHelper.post(res, appstrings.invalid_coupan,null,400);

      
    }
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});


module.exports = app;