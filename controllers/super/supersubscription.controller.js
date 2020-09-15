
const express = require('express');
const app     = express();
const bcrypt  = require('bcryptjs');
const v       = require('node-input-validator');
const jwt     = require('jsonwebtoken');
const hashPassword = require('../../helpers/hashPassword');
const Op = require('sequelize').Op;
const COMPANY= db.models.companies;
const STAFFROLE= db.models.staffRoles;
const Subscription= db.models.subscription;
function isAdminAuth(req, res, next) {
    if(req.session.userData){
      return next();
    }
    return res.redirect('/admin');
  }
  
  /**
  *@role Get Login Page
  *@Method POST
  *@author Saira Ansari
  */
  app.get('/', superAuth,async (req, res, next) => {
    try {
      const findData = await Subscription.findAll({
        where :{companyId :req.id}
      });
      return res.render('super/subscription/subscriptionList.ejs',{findData});
    } catch (e) {
        console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(superadminpath);
    }
  });

/**
*@role Get Add Page
*@Method POST
*@author Saira Ansari
*/
app.get('/add', superAuth,async (req, res, next) => {
  try {
    return res.render('super/subscription/add.ejs');
  } catch (e) {
    req.flash('errorMessage',e.message)
    return res.redirect(superadminpath);
  }
});

/**
*@role Add Sub Plan
*
*/
app.post('/postadd',superAuth,async (req, res) => {
  try {
    const data = req.body;
    const user = await Subscription.findOne({
      attributes: ['id'],

      where: {
        name: data.name,
      }
    });
    if (!user) {
      if(Array.isArray(data.feature))
    {
      var newFea = data.feature;
    }else
    {
      var  newFea = data.feature.split();
    }
      const users = await Subscription.create({
        name: data.name,
        price: data.minimumAmount,
        companyId: req.companyId,
        features: JSON.stringify(newFea)
      });
      if (users) {
        responseHelper.post(res, appstrings.added_success, null,200);
       
      }
     else  responseHelper.error(res, appstrings.oops_something, 400);

    }
      else  responseHelper.error(res, appstrings.already_exists, 400);

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }
})

/**
*@role View Details
*
*/
app.get('/view/:id',superAuth,async(req,res,next) => { 
  var id=req.params.id
  try {
    let responseNull=  common.checkParameterMissing([id])
    if(responseNull) 
    { return responseHelper.error(res, e.message, null);
    }
    const findData = await Subscription.findOne({
      where :{companyId :req.companyId, id: id },
      order: [
        ['createdAt','DESC']
      ],      
    });
    return res.render('super/subscription/view.ejs',{data:findData});
  } catch (e) {
    req.flash('errorMessage',e.message)
    return res.redirect(superadminpath);
  }
});

app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;
    const user = await Subscription.findOne({
      where: {
        id:data.planId,
        companyId: req.companyId

      }
    });

    if(Array.isArray(data.feature))
    {
      var newFea = data.feature;
    }else
    {
      var  newFea = data.feature.split();
    }

    if (user) {
      
    
      const users = await Subscription.update({
        name: data.name,
        price:data.minimumAmount,
        features: JSON.stringify(newFea)
       },

      { where:
       {
        id: data.planId,
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
    return responseHelper.error(res, e.message, null);
  }

})


app.post('/delete',superAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await Subscription.destroy({
          where: {
            id: req.body.id
          }
          })  
            
          if(numAffectedRows>0)
          {
          // req.flash('successMessage',appstrings.delete_success)
         return responseHelper.post(res, appstrings.delete_success,null,200);
        }

          else {
            return responseHelper.post(res, appstrings.no_record,null,400);
           // return res.redirect(superadminpath+"category");
          }

        }catch (e) {
          return responseHelper.error(res, e.message, 400);
          //req.flash('errorMessage',appstrings.no_record)
          //return res.redirect(superadminpath+"category");
        }
});



app.post('/status',superAuth,async(req,res,next) => { 
    
  var params=req.body
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
     
  
     const userData = await Subscription.findOne({
       where: {
         id: params.id }
     });
     
     
     if(userData)
     {
     

  var status=0
  if(params.status=="0")  status=1
     const updatedResponse = await Subscription.update({
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
           console.log(e)
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


module.exports = app;

//Edit User Profile
