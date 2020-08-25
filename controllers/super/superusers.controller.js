
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const USER= db.models.users


app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await USER.findAll({
        where :{companyId :req.companyId},
        order: [
          ['createdAt','DESC']
        ],      

        });




  

     
        return res.render('super/users/usersListing.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await USER.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await USER.update({
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


app.post('/adduser',superAuth,async (req, res) => {
  try {
    const data = req.body;
   var profileImage=""

    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    if (req.files) {

      ImageFile = req.files.image;    
      if(ImageFile)
      {
        profileImage = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ profileImage, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
        });

    }
  }


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
        image:profileImage,
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


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var profileImage=""


    let responseNull= commonMethods.checkParameterMissing([data.userId,data.phoneNumber,data.countryCode,data.firstName,data.email])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    if (req.files) {

      ImageFile = req.files.image;    
      if(ImageFile)
      {
        profileImage = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"users/"+ profileImage, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
  }



    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        id:data.userId,
        companyId: req.companyId

      }
    });



    if (user) {
      
      if(profileImage=="") profileImage=user.dataValues.image
      const users = await USER.update({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        image:profileImage,
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

})









app.get('/view/:id',superAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"users");
}


   
      const findData = await USER.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      

      });
   


      where={companyId: req.companyId,userId : id}
  

      const orderData = await ORDERS.findAll({
        order: [
          ['createdAt', 'DESC'],  
      ],
      where :where,
      
      include: [
        {model: db.models.address , attributes: ['id','addressName','addressType','houseNo','latitude','longitude','town','landmark','city'] } ,
        {model: USER , attributes: ['id','firstName','lastName',"phoneNumber","countryCode","image"]},
        {model: SUBORDERS , attributes: ['id','serviceId','quantity'],
        include: [{
          model: SERVICES,
          attributes: ['id','name','description','price','icon','thumbnail','type','price','duration'],
          required: false
        }]
        }
      
      ]
    });




      return res.render('super/users/viewUser.ejs',{data:findData,orders:orderData});



    } catch (e) {
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath+"users");
    }


 
});



app.get('/delete/:id',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.params.id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"users");
}

  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await USER.destroy({
          where: {
            id: req.params.id
          }
          })  
            
          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"users");

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"users");
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',appstrings.no_record)
          return res.redirect(superadminpath+"users");
        }
});




module.exports = app;

//Edit User Profile
