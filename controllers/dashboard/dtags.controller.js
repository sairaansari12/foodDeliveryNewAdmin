
const express = require('express');
const app     = express();



app.get('/',adminAuth, async (req, res, next) => {
  try {

    const findData = await COMPANY.findOne({
      attributes:['tags','id'],
      where: {
        id: req.id,
      }
    });
      if(findData && findData.dataValues.tags != ""){
         var inst = JSON.parse(findData.dataValues.tags);
     
    }else{
      var inst = [];
    }
    return res.render('admin/ordersetting/tags.ejs',{tags:inst });
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

/**
*@role Add TAg
*/
app.post('/addTag',adminAuth, async (req, res, next) => {
  try {
    const data = req.body;
    const findData = await COMPANY.findOne({
      where: {
        id: req.id,
      }
    });
    if(findData){
      var tag = data.tag;
      if(typeof tag=='string')
      tag=[data.tag]
      var mainArray = [];
      for (var i = 0; i < tag.length; i++) {
        if( tag[i] != ""){
          mainArray.push(tag[i]);
        }
      }
      //Update Instruction
      const users = await COMPANY.update({
        tags: JSON.stringify(mainArray)
      },
      {
        where: {
          id: req.id
        }
      });
    }
  
    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});



module.exports = app;

//Edit User Profile
