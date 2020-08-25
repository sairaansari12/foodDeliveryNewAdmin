
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;





app.get('/',superAuth, async (req, res, next) => {
    
  var compId=req.query.compId
  if(compId==undefined || compId=="") compId=req.companyId
  try{
   
    //var newDate = moment(new Date()).format("MM/DD/YYYY");
    const findData = await COUPAN.findAll({
      where: {
        companyId: compId,
        
      },
      include:[ {
        model: CATEGORY,
        as: 'category',
        attributes: ['name','icon','thumbnail'],
        required: false
      }]
    });
    
    var compData= await commonMethods.getAllCompanies(req.companyId)

        return res.render('super/coupans/coupanListing.ejs',{data:findData,compData:compData});

      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllParentCategories(req.companyId)
    var types=await commonMethods.getUserTypes(req.companyId) 

    return res.render('super/coupans/addCoupan.ejs',{catData:cdata,types:types});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await COUPAN.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await COUPAN.update({
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
               return responseHelper.post(res, 'Something went Wrong',null,400);
    
             }
       
       }

       else{
        return responseHelper.post(res, appstrings.no_record,null,204);

      }

         }
           catch (e) {
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.name,data.code,data.discount,data.type,data.validupto])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        code: data.code,
      }
    });



    if (!user) {
    



      const users = await COUPAN.create({
        name: data.name,
        type: data.type,
        usageLimit: data.usageLimit,
        code: data.code,
        discount: data.discount,
        icon: icon,
        validupto:data.validupto,
        thumbnail: thumbnail,
        description:data.description,
        companyId: req.companyId,
        categoryId:data.categoryId,
        minimumAmount:data.minimumAmount

       });


      if (users) {

        responseHelper.post(res, appstrings.add_coupan, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.minimumAmount,data.validupto, data.coupanId,data.name,data.code,data.discount,data.type])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"coupans/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.meessage, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"coupans/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await COUPAN.findOne({
      attributes: ['id'],

      where: {
        id: data.coupanId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail


      const users = await COUPAN.update({
        name: data.name,
        type: data.type,
        code: data.code,
        discount: data.discount,
        icon: icon,
        usageLimit: data.usageLimit,
        thumbnail: thumbnail,
        description:data.description,
        validupto:data.validupto,
        minimumAmount:data.minimumAmount,
        categoryId:data.categoryId




       },
       {where:{

        id: data.coupanId
       }}
       
       
       
       );


      if (users) {

        responseHelper.post(res, appstrings.update_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);


    }
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
   // console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})









app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"coupans");
}


   
      const findData = await COUPAN.findOne({
      where :{id: id }
      });
   
      var cdata= await commonMethods.getAllParentCategories(req.companyId)
      var types=await commonMethods.getUserTypes(req.companyId) 

      return res.render('super/coupans/viewCoupan.ejs',{data:findData,catData:cdata,types:types});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"coupans");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"coupans");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await COUPAN.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"coupans");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"coupans");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"coupans");
        }
});




module.exports = app;

//Edit User Profile
