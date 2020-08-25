
const express = require('express');
const app     = express();

const EMPLOYEE= db.models.employees
const SERVICES = db.models.services
const Op = require('sequelize').Op;
EMPLOYEE.belongsTo(ROLETYPE,{foreignKey: 'role'})


app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await EMPLOYEE.findAll({
        where :{companyId :req.companyId},
          
      include: [
       
          {model: ROLETYPE , attributes: ['id','userType'] }],

        order: [
          ['createdAt','DESC']
        ],      

        });
     
        return res.render('super/employees/employeesListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/list',superAuth, async (req, res, next) => {
    
  try {
      const findData = await EMPLOYEE.findAll({
      where :{companyId :req.companyId},
      order: [
        ['createdAt','DESC']
      ],      

      });
   
      return responseHelper.post(res, appstrings.success,findData);



    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});



app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await EMPLOYEE.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await EMPLOYEE.update({
         status: status,
    
       },
       {
         where : {
         id: userData.dataValues.id
       }
       });
       
       if(updatedResponse)
             {
    
           return responseHelper.post(res, appstrings.success,updatedResponse);
             }
             else{
               return responseHelper.post(res, 'Something went Wrong',400);
    
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

app.post('/subservice',superAuth,async(req,res,next) => { 
    
  var params=req.body

  var include=[]

  if(params.category!='0')
  {
   include=[ {
      model: SERVICES,
      as: 'category',
      attributes: ['name','icon','thumbnail'],
      required: true
    }

  
  ]
  }
    try{
      var services = await SERVICES.findAll({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices'],
        where: {
          parentId: params.category,
          status: 1
        },
        include: include,
        order: [
          ['orderby','ASC']
        ],
      })

if(services && services.length>0)   
{  
   for(i=0;i<services.length;i++){
  
        services[i]['rating'] = 0
      if(services[i].category==null || services[i].category==undefined)
      services[i]['category']=null
      
        // console.log(services[i].dataValues.category);
        

      }


      return responseHelper.post(res, appstrings.success, services);
    }
    else  return responseHelper.post(res, appstrings.no_record, null,204);


    }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

  
});





app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var profileImage="",idProof="",coverImage=""
    var assignedServices=[]


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    if(data.subcat && data.subcat.length>0) assignedServices=data.subcat.toString().split(",")
    if(data.service) assignedServices.push(data.service)

    const user = await EMPLOYEE.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        companyId: req.companyId

      }
    });



    if (!user) {



      if (req.files) {

        ImageFile = req.files.image;    
        if(ImageFile)
        {
          profileImage = Date.now() + '_' + ImageFile.name;
  
        ImageFile.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ profileImage, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.meessage, 400);   
          });
  
      }

      ImageFile1 = req.files.idProof;    
      if(ImageFile1)
      {
        idProof = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
          //upload file
          if (err)
          responseHelper.error(res, appstrings.err.meessage, 400);   
           });
    }
      

    ImageFile2 = req.files.coverImage;    
    if(ImageFile2)
    {
      coverImage = Date.now() + '_' + ImageFile2.name;
    ImageFile2.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ coverImage, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }



        }

      
      const users = await EMPLOYEE.create({
        firstName: data.firstName,
        email: data.email,
        dob: data.dob,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        platform: 'web',
        image : profileImage,
        idProof : idProof,
        coverImage:coverImage,
        idProofName:data.idProofName,
        assignedServices:assignedServices.toString(),
        companyId: req.companyId,
        role:data.role
       });


      if (users) {

        responseHelper.post(res, appstrings.add_emp_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
    const servicesData = await CATEGORY.findAll({
      attributes: ['id','name', 'icon','thumbnail'],
      where: {
        status: 1,
        level :1,
        id:  {[Op.not]: '0'},
             },
      order: [
        ['orderby','ASC']
      ],
    })

    var types=await commonMethods.getRoleTypes(req.companyId) 
    return res.render('super/employees/addEmployee.ejs',{services: servicesData,role:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/map',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/employees/employeeMap.ejs');

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var assignedServices=[]
    var profileImage="",idProof="",coverImage=""

    let responseNull= commonMethods.checkParameterMissing([data.empId,data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


if(data.subcat && data.subcat.length>0) assignedServices=data.subcat.toString().split(",")
if(data.service) assignedServices.push(data.service)



    if (req.files) {

      ImageFile = req.files.image;    
      if(ImageFile)
      {
        profileImage = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ profileImage, function (err) {
          //upload file
          if (err)
         return responseHelper.error(res, err.message, 400);   
      });

    }

    ImageFile1 = req.files.idProof;    
    if(ImageFile1)
    {
      idProof = Date.now() + '_' + ImageFile1.name;
    ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }

  ImageFile2 = req.files.coverImage;    
  if(ImageFile2)
  {
    coverImage = Date.now() + '_' + ImageFile2.name;
  ImageFile2.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ coverImage, function (err) {
      //upload file
      if (err)
      {
        console.log(err)
      return responseHelper.error(res, err.message, 400);   
      }
    });
}
    
      }








    const user = await EMPLOYEE.findOne({
      attributes: ['phoneNumber'],
      where: {
        id:data.empId,
        companyId: req.companyId

      }
    });



    if (user) {

      if(profileImage=="") profileImage=user.dataValues.image
      if(idProof=="") idProof=user.dataValues.idProof
      if(coverImage=="") coverImage=user.dataValues.coverImage

      
      const users = await EMPLOYEE.update({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        dob: data.dob,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        image : profileImage,
        idProof : idProof,
        coverImage:coverImage,
        idProofName:data.idProofName,
        role:data.role,
        assignedServices:assignedServices.toString()
       },

      { where:
       {
id: data.empId,
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

})









app.get('/view/:id',superAuth,async(req,res) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"employees");
}


   
      const findData = await EMPLOYEE.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   

      const servicesData = await CATEGORY.findAll({
        attributes: ['id','name', 'icon','thumbnail'],
        where: {
          status: 1,
          level:1,
          id:  {[Op.not]: '0'},
               },
        order: [
          ['orderby','ASC']
        ],
      })


      var types=await commonMethods.getRoleTypes(req.companyId) 

      return res.render('super/employees/viewEmployee.ejs',{data:findData,services:servicesData,role:types});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"employees");
    }


 
});


app.get('/orders',superAuth,async(req,res) => { 
  
  var id=req.query.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"employees");
}


   
      const findData = await EMPLOYEE.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   

 
      
        var user = await ASSIGNMENT.findAll({
          attributes: ['id','rating','review','ratingOn'],
                where :{empId: id,
          rating:  {[Op.not]: '0'},
   
        },
        order: [
          ['createdAt', 'DESC']],
         
        include: [
          {model: ORDERS , attributes: ['id','orderNo','serviceDateTime'],
          include: [{
            model: USER,
            attributes: ['id','firstName','lastName','image'],
            required: false
          }]
        },
    
      ],
        });
   
  var rating=0
   var dataRating=await commonMethods.getEmpAvgRating(id) 
   if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) rating=dataRating.dataValues.totalRating
   return res.render('super/employees/viewEmployeeOrders.ejs',{data:findData,ratings:user,avgRating :rating});

          
     


  




    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"employees");
    }


 
});


app.post('/orders',superAuth,async(req,res) => { 
  
  try {
    var params=req.body
    var progressStatus =  ['0','1','2','3','4','5']
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
          {model: ASSIGNMENT , attributes: ['id'], required:true,where:{empId:params.empId,jobStatus :1} },
          {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
          {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
          include: [{
            model: SERVICES,
            attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
            required: false
          }]
          }
        
        ],
        offset: offset, limit: limit ,
        distinct:true,

      });
  
      var countDataq = await ORDERS.findAll({
        attributes: ['progressStatus',
          [sequelize.fn('sum', sequelize.col('totalOrderPrice')), 'totalSum'],
          [sequelize.fn('COUNT', sequelize.col('progressStatus')), 'count'],
         
  
        ],
        group: ['progressStatus'],
      where :where1,
      include: [
        {model: ASSIGNMENT , attributes: ['id'], required:true,where:{empId:params.empId,jobStatus :1} }],

    
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


 




app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"employees");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await EMPLOYEE.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"employees");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"employees");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"employees");
        }
});




module.exports = app;

//Edit User Profile
