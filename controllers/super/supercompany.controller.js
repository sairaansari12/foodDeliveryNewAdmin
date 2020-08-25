
const express = require('express');
const app     = express();
const hashPassword = require('../../helpers/hashPassword');



app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await COMPANY.findAll({
        where :{parentId :req.id},
        order: [
          ['companyName','ASC']
        ],      

        });
        return res.render('super/company/companyListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await COMPANY.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await COMPANY.update({
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


app.get('/add',superAuth, async (req, res, next) => {
    
  try{
  
    return res.render('super/company/addCompany.ejs',);

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    var logo1 = "";
    var logo2 = "";
    var logo3 = "";


    let responseNull= commonMethods.checkParameterMissing([data.companyName,data.email,data.address1,data.phoneNumber,data.password])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    const newPassword = await hashPassword.generatePass(data.password);

    //Uploading Comapny Images
    if (req.files) {
      var ImageFile = req.files.image;
      if(ImageFile)
      {
        logo1 = Date.now() + '_' + ImageFile.name;
          ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ logo1, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile2 = req.files.image2;
      if(ImageFile2)
      {
          logo2 = Date.now() + '_' + ImageFile2.name;
          ImageFile2.mv(config.UPLOAD_DIRECTORY +"users/"+ logo2, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile3 = req.files.image3;
      if(ImageFile3)
      {
        logo3 = Date.now() + '_' + ImageFile3.name;
        ImageFile3.mv(config.UPLOAD_DIRECTORY +"users/"+ logo3, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
    }
    const user = await COMPANY.findOne({
      where :{companyName: data.companyName,
        email: data.email }
    });
    if (!user) {
      // if(logo1 == "")
      // {
      //   logo1 = user.dataValues.logo1;
      // }
      // if(logo2 == "")
      // {
      //   logo2 = user.dataValues.logo2;
      // }
      // if(logo3 == "")
      // {
      //   logo3 = user.dataValues.logo3;
      // }
      //update Record
      const users = await COMPANY.create({
          companyName: data.companyName,
          email: data.email,
          address1: data.address1,
          address2: data.address2,
          address1LatLong: data.address1LatLong,
          address2LatLong: data.address2LatLong,
          websiteLink: data.websiteLink,
          logo1:logo1,
          logo2:logo2,
          logo3:logo3,
          password:newPassword,
          parentId: req.id,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
        });
     
  
        responseHelper.post(res, appstrings.company_add, null,200);
      
    }
      else  responseHelper.post(res, appstrings.already_exists, 204);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var logo1 = "";
    var logo2 = "";
    var logo3 = "";
  var password=""
    let responseNull= commonMethods.checkParameterMissing([data.companyId,data.companyName,data.email,data.address1,data.phoneNumber,data.password])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

    //const newPassword = await hashPassword.generatePass(data.password);
    //Uploading Comapny Images
    if (req.files) {
      var ImageFile = req.files.image;
      if(ImageFile)
      {
        logo1 = Date.now() + '_' + ImageFile.name;
          ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ logo1, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile2 = req.files.image2;
      if(ImageFile2)
      {
          logo2 = Date.now() + '_' + ImageFile2.name;
          ImageFile2.mv(config.UPLOAD_DIRECTORY +"users/"+ logo2, function (err) {
            //upload file
            if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
      var ImageFile3 = req.files.image3;
      if(ImageFile3)
      {
        logo3 = Date.now() + '_' + ImageFile3.name;
        ImageFile3.mv(config.UPLOAD_DIRECTORY +"users/"+ logo3, function (err) {
          //upload file
          if (err)
            return responseHelper.error(res, err.message, 400);
        });
      }
    }
    const user = await COMPANY.findOne({
      where :{id :data.companyId }
    });
    if (user) {

      console.log(data.password+">>>>>>>>>>>"+user.dataValues.password)

      const match =(data.password==user.dataValues.password);

      console.log(">>>>>>>>>>>"+match)
if(!match) password=await hashPassword.generatePass(data.password); 
else  password=user.dataValues.password 

      if(logo1 == "")
      {
        logo1 = user.dataValues.logo1;
      }
      if(logo2 == "")
      {
        logo2 = user.dataValues.logo2;
      }
      if(logo3 == "")
      {
        logo3 = user.dataValues.logo3;
      }
      //update Record
      const users = await COMPANY.update({
          companyName: data.companyName,
          email: data.email,
          address1: data.address1,
          address2: data.address2,
          address1LatLong: data.address1LatLong,
          address2LatLong: data.address2LatLong,
          websiteLink: data.websiteLink,
          logo1:logo1,
          logo2:logo2,
          logo3:logo3,
          password:password,
          phoneNumber: data.phoneNumber,
          countryCode: data.countryCode,
        },
        {
          where :{id :data.companyId }
        }
      );
      if (users) {
        responseHelper.post(res, appstrings.update_success, null,200);
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);
    }
      else  responseHelper.post(res, appstrings.no_record, 204);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})



app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"company");
}


   
      const findData = await COMPANY.findOne({
      where :{id: id }});
   
      return res.render('super/company/viewCompany.ejs',{data:findData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"company");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"company");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await COMPANY.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"company");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"company");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"company");
        }
});




module.exports = app;

//Edit User Profile
