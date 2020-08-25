
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const SERVICES = db.models.services
const CATEGORY = db.models.categories
const FAVOURITES = db.models.favourites



app.get('/',adminAuth, async (req, res, next) => {
    
  var id = req.query.id
 var include=[]
  var  where={
  companyId: req.companyId

       }

  if(id && id!="") 
  {
  where={companyId: req.companyId}
  include= [{
    model: CATEGORY,
    as: 'category',
    attributes: ['id','name','icon','thumbnail','connectedCat'],
    where: {

      [Op.or]: [
        {connectedCat: {[Op.like]: '%'+ id + '%'}},
        { id:  id}]},
       


    required: true
  }]


      }

    try {
      const servicesData = await SERVICES.findAll({
        attributes: ['id','name','description','price','icon','thumbnail','type','price','duration','turnaroundTime','includedServices','excludedServices','createdAt','status'],
        where: where,
          include:include,    
        order: [
          ['orderby','ASC']
        ],
      });
     
      var cdata= await commonMethods.getAllParentCategories(req.companyId)

    return res.render('admin/service/servicesListing.ejs',{data:servicesData,parData:cdata});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});




app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllCategories(req.companyId)
    var pdata= await commonMethods.getAllParentCategories(req.companyId)

    return res.render('admin/service/addService.ejs',{catData:cdata,parData: pdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',adminAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
    
       const userData = await SERVICES.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await SERVICES.update({
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


app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName,data.type,data.duration,data.price,data.categoryId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await SERVICES.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {
    
      const users = await SERVICES.create({
        name: data.serviceName,
        description: data.description,
        type: data.type,
        price: data.price,
        duration: data.duration,
        icon: icon,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        companyId: req.companyId,
        categoryId :data.categoryId

       });


      if (users) {

        responseHelper.post(res, appstrings.add_service, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/update',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.serviceName,data.type,data.duration,data.price,data.categoryId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await SERVICES.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId,
        companyId: req.companyId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await SERVICES.update({
        name: data.serviceName,
        description: data.description,
        type: data.type,
        price: data.price,
        duration: data.duration,
        icon: icon,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        companyId: req.companyId,
        categoryId :data.categoryId

       },
       {where:{

        id: data.serviceId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})









app.get('/view/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"service");
}
      const findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id },
      include:[{
        model: CATEGORY,
        as: 'category',
        attributes: ['id','name','icon','thumbnail','connectedCat'],
        required: true
      }]

      

      });
   
      var cdata= await commonMethods.getAllCategories(req.companyId)
      var pdata= await commonMethods.getAllParentCategories(req.companyId)

      return res.render('admin/service/viewService.ejs',{data:findData,catData:cdata,parData:pdata});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"service");
    }


 
});



app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"service");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await SERVICES.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(adminpath+"service");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(adminpath+"service");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(adminpath+"service");
        }
});




module.exports = app;

//Edit User Profile
