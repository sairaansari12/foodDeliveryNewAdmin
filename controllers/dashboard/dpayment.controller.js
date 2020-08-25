
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

PAYMENT.belongsTo(USERS,{foreignKey: 'userId'})
PAYMENT.belongsTo(ORDERS,{foreignKey: 'orderId'})



app.get('/',adminAuth, async (req, res, next) => {
    
 try{
      return res.render('admin/payment/paymentListing.ejs',{data:null});

 }

    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/list',adminAuth, async (req, res, next) => {
  
try {
  var params=req.body
  var transactionStatus =  ['0','1','2']
  var fromDate =  ""
  var toDate =  ""


  var page =1
  var limit =50
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)
  var offset=(page-1)*limit


  if(params.transactionStatus && params.transactionStatus!="")  transactionStatus=[params.transactionStatus]

  where={companyId: req.companyId,
    transactionStatus: { [Op.or]: transactionStatus}
     }
     where1={companyId: req.companyId,transactionStatus: { [Op.or]: transactionStatus}}


  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
  

if(fromDate!="" && toDate!="")
{
  where= {companyId: req.companyId,
    transactionStatus: { [Op.or]: transactionStatus},
    createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
       }

       where1={companyId: req.companyId,
        transactionStatus: { [Op.or]: transactionStatus},
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
           }

      }

      const findData = await PAYMENT.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :where,
      
      include: [
        {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","email","image"]},       
        {model: ORDERS , attributes: ['id','createdAt','orderNo'],required:true},       

      
      ],
      distinct:true,
      offset: offset, limit: limit ,

    });

    console.log(findData)

    var countDataq = await PAYMENT.findAll({
      attributes: ['transactionStatus','paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count'],
       

      ],
      group: ['transactionStatus'],
    where :where1});


    var escrowDataq = await PAYMENT.findAll({
      attributes: ['paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('paymentState')), 'count'],
       

      ],
      group: ['paymentState'],
    where :where1});

    var userDtaa={}
    userDtaa.data=findData
    userDtaa.counts=countDataq
    userDtaa.escrow=escrowDataq


    return responseHelper.post(res, appstrings.success, userDtaa);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }


});


app.post('/search',adminAuth, async (req, res, next) => {
  
try {
  var params=req.body
  var transactionStatus =  ['0','1','2']
  var fromDate =  ""
  var toDate =  ""


  var page =1
  var limit =50
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)
  var offset=(page-1)*limit



  
      const findData = await PAYMENT.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :where,
      
      include: [
        {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","email","image"],
        required: true, 
        where: {
          [Op.or]: [
            { 
              firstName: {
                [Op.like]: `%${params.search}%`
              }
            }
          ]
        }},       
        {model: ORDERS , attributes: ['id','createdAt','orderNo'],required:true},       

      
      ],
      distinct:true,
      offset: offset, limit: limit ,

    });

    console.log(findData)

    var countDataq = await PAYMENT.findAll({
      attributes: ['transactionStatus','paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('transactionStatus')), 'count'],
       

      ],
      group: ['transactionStatus'],
    where :where1});


    var escrowDataq = await PAYMENT.findAll({
      attributes: ['paymentState',
        [sequelize.fn('sum', sequelize.col('amount')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('paymentState')), 'count'],
       

      ],
      group: ['paymentState'],
    where :where1});

    var userDtaa={}
    userDtaa.data=findData
    userDtaa.counts=countDataq
    userDtaa.escrow=escrowDataq


    return responseHelper.post(res, appstrings.success, userDtaa);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await PAYMENT.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

     
    const updatedResponse = await PAYMENT.update({
      transactionStatus: params.status,

       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, appstrings.success,null);
             }
             else{
               return responseHelper.post(res, appstrings.oops_something,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


module.exports = app;

