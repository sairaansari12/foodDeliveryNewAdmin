
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const ORDERS= db.models.orders
const SUBORDERS=db.models.suborders
const SERVICES = db.models.services
const USER = db.models.users
var moment = require('moment')

SUBORDERS.belongsTo(SERVICES,{foreignKey: 'serviceId'})
ASSIGNMENT.belongsTo(EMPLOYEE,{foreignKey: 'empId'})
ORDERS.belongsTo(db.models.address,{foreignKey: 'addressId'})
ORDERS.belongsTo(USER,{foreignKey: 'userId'})
ORDERS.hasMany(ASSIGNMENT,{foreignKey: 'orderId'})
ORDERS.hasMany(SUBORDERS,{foreignKey: 'orderId'})
ORDERS.hasOne(PAYMENT,{foreignKey: 'orderId'})


app.get('/',adminAuth, async (req, res, next) => {
    
  try {
    var params=req.query
   var pStatus= await commonMethods.getOrdersAllStatus(req.parentCompany);
   progressStatus = pStatus.map(user => user.status);

    var page =1
    var limit =100
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    if(params.progressStatus && params.progressStatus!="")  progressStatus=[params.progressStatus]

 
    var offset=(page-1)*limit

   
    const findData = await ORDERS.findAll({
      order: [
        ['createdAt', 'DESC'],  
    ],
    where :{companyId: req.companyId,
      progressStatus: { [Op.or]: progressStatus},

    },
    offset: offset, limit: limit ,
    
   
  });
  var empData = await EMPLOYEE.findAll({
    where :{companyId:req.companyId}

});
const findDataSetting = await DOCUMENT.findOne({
          where :{companyId :req.companyId }
        });
        var pStatus= await ORDERSTATUS.findAll({companyId:req.parentCompany});

      return res.render('admin/orders/ordersListing.ejs',{data:findData,empData:empData,findDataSetting,options:pStatus});

    

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});



app.post('/list',adminAuth, async (req, res, next) => {
  
try {
  var params=req.body
  //var progressStatus =  ['0','1','2','3','4','5']
    var pStatus= await ORDERSTATUS.findAll({companyId:req.parentCompany});
    pStatus = pStatus.map(user => user.status);

    var progressStatus =  pStatus
  var fromDate =  ""
  var toDate =  ""


  var page =1
  var limit =50
  if(params.page) page=params.page
  if(params.limit) limit=parseInt(params.limit)
  var offset=(page-1)*limit


  if(params.progressStatus && params.progressStatus!="")  progressStatus=[params.progressStatus]

  where={companyId: req.companyId,
  progressStatus: { [Op.or]: progressStatus}
     }
  

     where1={companyId: req.companyId,progressStatus: { [Op.or]: progressStatus}}
  if(params.fromDate)fromDate= Math.round(new Date(params.fromDate).getTime())
  if(params.toDate) toDate=Math.round(new Date(params.toDate).getTime())
  

if(fromDate!="" && toDate!="")
{
  where= {companyId: req.companyId,
    progressStatus: { [Op.or]: progressStatus},
    createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
       }

       where1={companyId: req.companyId,
        progressStatus: { [Op.or]: progressStatus},
        createdAt: { [Op.gte]: fromDate,[Op.lte]: toDate},
           }

      }

      const findData = await ORDERS.findAndCountAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :where,
      
      include: [
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
        {model: PAYMENT , attributes: ['transactionStatus']},
        {model: ORDERSTATUS , attributes: ['statusName']},
        {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        include: [{
          model: SERVICES,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
          required: false
        }]
        }
      
      ],
      distinct:true,
      offset: offset, limit: limit ,

    });

    var countDataq = await ORDERS.findAll({
      attributes: ['progressStatus',
        [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
        [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count'],
       

      ],
      group: ['progressStatus'],
    where :where1
  
  });



 

    var userDtaa={}
    userDtaa.data=findData
    userDtaa.counts=countDataq
   

    return responseHelper.post(res, appstrings.success, userDtaa);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message, 400);
  }


});


app.post('/search',adminAuth, async (req, res, next) => {
  
  try {
    var params=req.body
    var page =1
    var limit =50
    var search=params.search
    if(params.page) page=params.page
    if(params.limit) limit=parseInt(params.limit)
    var offset=(page-1)*limit
  
  
    where={
      companyId:req.companyId,
      [Op.or]: [
        { 'orderNo': { [Op.like]: '%' + search + '%' }},
        { 'serviceDateTime': { [Op.like]: '%' + new Date(search) + '%' }},
        { 'orderPrice': { [Op.like]: '%' + search + '%' }},
        { 'totalOrderPrice': { [Op.like]: '%' + search + '%' }},

        

        
      ]
    }


    whereAddress= {[Op.or]: [
            
      { 'addressName': { [Op.like]: '%' + search + '%' }},
      { 'houseNo': { [Op.like]: '%' + search + '%' }},
      { 'town': { [Op.like]: '%' + search + '%' }},
      { 'city': { [Op.like]: '%' + search + '%' }},
      { 'landmark': { [Op.like]: '%' + search + '%' }}]}


      whereUser= 
        {

          phoneNumber :{[Op.not]:""},
          [Op.or]: [
            { 'phoneNumber': { [Op.like]: '%' + search + '%' }},
            { 'firstName': { [Op.like]: '%' + search + '%' }},
            { 'lastName': { [Op.like]: '%' + search + '%' }}

        
        ]}

        
  
       // { '$Comment.body$': { like: '%' + query + '%' }
      
    
var findData= await findSearchData(where,{},{},offset,limit)


if(findData.rows.length==0)
{
 findData= await findSearchData({companyId:req.companyId},whereAddress,{},offset,limit)
}



if(findData.rows.length==0)
{

 findData= await findSearchData({companyId:req.companyId},{},whereUser,offset,limit)
}


  
   
  
      var userDtaa={}
      userDtaa.data=findData
      //userDtaa.counts=countData
     
  
      return responseHelper.post(res, appstrings.success, userDtaa);
  
    } catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }
  
  
  });
  


  app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body

        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      
       var userData = await ORDERS.findOne({
         where: {
           id: params.id },
           include: [{
            model: ASSIGNMENT , attributes: ['id'],
           include: [{model: EMPLOYEE,
           attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
           required: false
         }]
       }]
       });
       
       
       if(userData)
       {
      
         //Check Auto Assignment
          if(params.status == '1')
          {
            var date2 = new Date();
            var dateTime2 = moment(date2).format("YYYY-MM-DD");
            const findDataSetting = await DOCUMENT.findOne({
              where :{companyId :req.companyId }
            });
            if(findDataSetting.dataValues.autoAssign == "yes")
            {
              var items = await EMPLOYEE.findAll({
                where: {
                  loginstatus: '1',
                  companyId: req.companyId,
                  role: '1'
                }
              });

              if(items)
              {
                var BusyEmp = [];
                var idelEmp = [];
                for (var i = 0; i < items.length; i++) {
                  var empId = items[i].id;
                  var itemss = await ASSIGNMENT.findOne({
                    where: {
                      empId: empId,
                      jobStatus: '1'
                    },
                    include: [{
                      model: ORDERS,
                      required:true,
                      serviceDateTime: {
                        [Op.eq]: userData.dataValues.serviceDateTime
                      }
                    }]
                  });
                  if(!itemss)
                  {
                    idelEmp.push(empId);
                  }
                  else{
                    BusyEmp.push(empId);
                  }
                }
                console.log(idelEmp,"idelEmp");
                console.log(BusyEmp,"BusyEmp");
              }

              if(idelEmp.length > 0)
              {
                for(var pd=0;pd<idelEmp.length;pd++)
                {
                  await ASSIGNMENT.create({
                    empId: idelEmp[pd],
                    orderId: params.id,
                    jobStatus: '0'
                  });
                }
              }
            }
          }


if(params.status=='5')
{
     var empId=0
    var assignedDatat=await ASSIGNMENT.findOne({where:{orderId:params.id,jobStatus:1}})
   if(assignedDatat && assignedDatat.dataValues)
   empId=assignedDatat.dataValues.empId
  ASSIGNMENT.update({jobStatus:3},{where : {empId:empId,orderId:params.id}});
}


        const updatedResponse = await ORDERS.update({
            progressStatus: params.status

          },
          {
            where : {
              id: userData.dataValues.id
          }
        });
        

      
      //Check Auto Assignment
       if(updatedResponse)
             {
              var status=await commonMethods.getOrderStatus(params.status)
              
                userData=JSON.parse(JSON.stringify(userData))
                        var findData=await USER.findOne({where:{id:userData.userId}});
                   var notifPushUserData={title:"Your order No.- "+userData.orderNo +' is '+status+ ' on ' +commonMethods.formatAMPM(new Date),
                        description:"Your order No.- "+userData.orderNo +' is ' + status+' on ' +commonMethods.formatAMPM(new Date),
                        token:findData.dataValues.deviceToken,  
                            platform:findData.dataValues.platform,
                            userId :userData.userId, role :3,
                            orderId:userData.id,
                            notificationType:"ORDER_STATUS",status:status,
                  }
                  

                 
   
                  if(userData.assignedEmployees && userData.assignedEmployees.length>0 && (params.status==2|| params.status==4))
                  {
                    for(var p=0;p<userData.assignedEmployees.length;p++)
                    {
        
                          var findData=await EMPLOYEE.findOne({where:{id:userData.assignedEmployees[p].employee.id}});
                          
                          
                          var notifPushUserDataEmp={title:"Your order No.- "+userData.orderNo +' is '+status+ ' on ' +commonMethods.formatAMPM(new Date),
                          description:"Your order No.- "+userData.orderNo +' is ' + status+' on ' +commonMethods.formatAMPM(new Date),
                          token:findData.dataValues.deviceToken,  
                              platform:findData.dataValues.platform,
                              userId :findData.id, role :4,
                              orderId:userData.id,
                              notificationType:"ORDER_STATUS",status:status,
                    }
                    commonNotification.insertNotification(notifPushUserDataEmp)   
                    commonNotification.sendEmpNotification(notifPushUserDataEmp)
        
                  }
                }

            commonNotification.insertNotification(notifPushUserData)   
             commonNotification.sendNotification(notifPushUserData)




           return responseHelper.post(res, appstrings.success,null);
             }
             else{
               return responseHelper.post(res, appstrings.oops_something,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,204);

      }


    
    
    
});



app.post('/updateAssignment',adminAuth,async(req,res,next) => { 
    
  var params=req.body
  var employees=[]
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.orderId])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
    if(params.employees) employees=params.employees.toString().split(",")

    var ordData = await ORDERS.findOne({
      where: {
        id: params.orderId }
    });
    

if(ordData && (ordData.dataValues.progressStatus==0))  
 return responseHelper.post(res, appstrings.order_not_confirmed,null,400);

   for(var k=0;k<employees.length;k++)
   {
   await ASSIGNMENT.create({
       empId: employees[k],
       orderId :params.orderId,
       jobStatus:0

  });

              
          var findData=await EMPLOYEE.findOne({where:{id:employees[k]}});

         var notifPushUserData={title:appstrings.new_order_assigned+"  "+commonMethods.formatAMPM(new Date),
          description:appstrings.new_order_assigned+'  ' +commonMethods.formatAMPM(new Date) +" Order No- "+ordData.orderNo,
          token:findData.dataValues.deviceToken,  
          orderId:ordData.id,
              platform:findData.dataValues.platform,
              userId :findData.id, role :4,
              notificationType:"ORDER_STATUS",status:0,
    }
    
commonNotification.insertNotification(notifPushUserData)   
commonNotification.sendEmpNotification(notifPushUserData)





}
  
         return responseHelper.post(res, appstrings.success,null);
           }
          
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


app.post('/adduser',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        companyId: req.companyId

      }
    });



    if (!user) {
      
      const users = await USER.create({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        platform: 'web',
        companyId: req.companyId
       });


      if (users) {

        responseHelper.post(res, appstrings.add_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    return responseHelper.error(res, 'Error While Creating User', e.message);
  }

})


app.post('/update',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.userId,data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        id:data.userId,
        companyId: req.companyId

      }
    });



    if (user) {
      
      const users = await USER.update({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
       },

      { where:
       {
id: data.userId,
companyId: req.companyId
       }
      }
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.post(res, appstrings.no_record, 204);

    

  } catch (e) {
    return responseHelper.error(res, 'Error While Creating User', e.message);
  }
});


app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"orders");
}

      const findData = await ORDERS.findOne({
      where :{companyId :req.companyId, id: id },
      include: [
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: USERS , attributes: ['firstName','lastName','countryCode','phoneNumber','image'] } ,
        {model: PAYMENT , attributes: ['transactionId','paymentMode','transactionStatus']},
        {model: ASSIGNMENT , attributes: ['id'],
        include: [{
          model: EMPLOYEE,
          attributes: ['id','firstName','lastName','countryCode','phoneNumber','image'],
          required: false
        }]
      
      } ,
      {model: ORDERSTATUS , attributes: ['statusName']},
        {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        include: [{
          model: SERVICES,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','originalPrice'],
          required: false
        }]},
        
      ]
      
            
      });

      var empData = await EMPLOYEE.findAll({
        where :{companyId:req.companyId,
          role:  {
            [Op.in]: ['1']
          }}
      });
      var AllempData = await EMPLOYEE.findAll({
        where :{
          companyId:req.parentCompany,
          role:  {
            [Op.in]: ['1']
          }
        }
      });
      var instructions = await INSTRUCTIONS.findOne({
        where :{companyId:req.companyId}
    
    });


    var pStatus= await commonMethods.getOrdersAllStatus(req.parentCompany);

      return res.render('admin/orders/viewOrder.ejs',{data:findData,empData:empData,instructions,AllempData,options:pStatus});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"orders");
    }


 
});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    return res.render('admin/orders/addOrder.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});




app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"orders");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await ORDERS.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"orders");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"orders");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"orders");
        }
});


async function findSearchData(where,whereAddress,whereUser,offset,limit)
  {


    const findData = await ORDERS.findAndCountAll({
      order: [
        ['createdAt', 'DESC'],  
    ],
    where :where,

    include: [
      {model: ADDRESS  ,
        attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'],
        where:whereAddress
      } ,
      {model: USER , 
        attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"],
        where:whereUser},
      {model: PAYMENT , attributes: ['transactionStatus']},
      {model: ORDERSTATUS , attributes: ['statusName']},
      {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
      include: [{
        model: SERVICES,
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
        required: false
      }]
      }
    
    ],

    distinct:true,
    offset: offset, limit: limit ,
    


  });

  return findData
  }
module.exports = app;

