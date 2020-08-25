
const express = require('express');
const app     = express();
const bcrypt  = require('bcryptjs');
const v       = require('node-input-validator');
const jwt     = require('jsonwebtoken');
const hashPassword = require('../../helpers/hashPassword');
const COMPANY= db.models.companies
function issuperAuth(req, res, next) {
    if(req.session.userData){
      return next();
    }
    return res.redirect('/company');
  }
/**
*@role Get Login Page
*@Method POST
*@author Saira Ansari
*/
app.get('/', superAuth,async (req, res, next) => {
    try {
        const findData = await DOCUMENT.findOne({
          where :{companyId :req.id }
        });
        return res.render('super/document/viewDocument.ejs',{data:findData});
      } catch (e) {
          console.log(e)
        req.flash('errorMessage',e.message)
        return res.redirect(superadminpath);
      }
  
});







app.post('/update',superAuth,async(req,res,next) => { 
  
    var params=req.body
  var documentId=params.documentId
 

        try{
            
                  
                if(documentId && documentId!="")
               {
                
               var response= await DOCUMENT.update({ 
                  aboutus: params.aboutus,
                  aboutusLink:  params.aboutusLink,
                  privacyContent:  params.privacyContent,
                  privacyLink:  params.privacyLink,
                  termsContent:  params.termsContent,
                  termsLink:  params.termsLink,
                  websiteLink:  params.websiteLink,
                  facebookLink:  params.facebookLink,
                  gmailLink:  params.gmailLink,
                  linkedinLink:  params.linkedinLink,
                  twitterLink:  params.twitterLink,
                  instaLink:  params.instaLink,
                  currency:  params.currency,
                  language:  params.language,
                  autoAssign:  params.autoAssign,
                  companyId: req.id

 },
          
                  {where: { id: documentId}}) ; 
                  CURRENCY=params.currency

                 return responseHelper.post(res, appstrings.update_success,null,200);
               }
                
                     
                else{

                  var response= await DOCUMENT.create({ 
                    aboutus: params.aboutus,
                    aboutusLink:  params.aboutusLink,
                    privacyContent:  params.privacyContent,
                    privacyLink:  params.privacyLink,
                    termsContent:  params.termsContent,
                    termsLink:  params.termsLink,
                    websiteLink:  params.websiteLink,
                    facebookLink:  params.facebookLink,
                    gmailLink:  params.gmailLink,
                    linkedinLink:  params.linkedinLink,
                    twitterLink:  params.twitterLink,
                    instaLink:  params.instaLink,
                    currency:  params.currency,
                    language:  params.language,
                    autoAssign:  params.autoAssign,
                    companyId: req.id
   }) ; 
   CURRENCY=params.currency

              if(response)return responseHelper.post(res, appstrings.update_success,null,200);

           else  return responseHelper.post(res, appstrings.oops_something,null,200);
                }
               
                       
    }catch (e) {
        console.log(e)
          return responseHelper.error(res, e.message);

    //  return responseHelper.error(res, e.message, 400);
    }
});

app.get('/changePassword',superAuth, async (req, res, next) => {
   return res.render(superadminfilepath+'changePassword.ejs');
});


module.exports = app;

//Edit User Profile
