
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;

const CATEGORY = db.models.categories
const FAVOURITES = db.models.favourites



app.get('/',superAuth, async (req, res, next) => {
    
  var id = req.query.id
  var compId = req.query.compId
 
  
  var  where={
  parentId:  {[Op.not]: '0'},
  level:2

       }

  if(id && id!="") where={parentId:  id}

       if(compId && compId!="")
       where.companyId=compId
      
  try{
   
   
      const servicesData = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail','createdAt','status','parentId','level'],
        where: where,
               include:[ {
                model: CATEGORY,
                as: 'category',
                attributes: ['name','icon','thumbnail'],
                required: true
              }],
              
        order: [
          ['orderby','ASC']
        ],
      });
     

      var cdata= await commonMethods.getAllParentCategories(req.companyId)
      var compData= await commonMethods.getAllCompanies(req.companyId)

        return res.render('super/subcategory/subCategory.ejs',{parData:cdata,data:servicesData,compData:compData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});







app.get('/add',superAuth, async (req, res, next) => {
    
  try{

    
    var cdata= await  commonMethods.getAllParentCategories(req.companyId)

    return res.render('super/subcategory/addSubCategory.ejs',{parData:cdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.post('/status',superAuth,async(req,res,next) => { 
    
    var params=req.body
    try{
        let responseNull=  commonMethods.checkParameterMissing([params.id,params.status])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
      

       const userData = await CATEGORY.findOne({
         where: {
           id: params.id }
       });
       
       
       if(userData)
       {
       

    var status=0
    if(params.status=="0")  status=1
       const updatedResponse = await CATEGORY.update({
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


app.post('/getSubCat',superAuth,async(req,res,next) => { 
    
  var params=req.body
var where ={
  parentId :params.category
       }

  if(params.compId && params.compId!="")
  where.companyId= params.compId
  
  try{
      let responseNull=  commonMethods.checkParameterMissing([params.category])
      if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
    

      const catData = await CATEGORY.findAll({
        attributes: ['id','name','description','icon','thumbnail','createdAt','status'],
        where: where,
              
        order: [
          ['orderby','ASC']
        ],
      });
     
     if(catData)
     {
    
         return responseHelper.post(res, appstrings.success,catData);
           }
           else{
             return responseHelper.post(res, appstrings.oops_something,null,400);
  
           }
     
  

       }
         catch (e) {
           return responseHelper.error(res, e.message, 400);
         }
  
  
  
});


app.post('/add',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.pcategory,data.category,data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        name: data.serviceName,
        companyId: req.companyId

      }
    });



    if (!user) {

     var parentId=0
     var level=1
  var connectCat=[data.pcategory]
     if(data.category && data.category!=""){ parentId=data.category
    level=2
    connectCat.push(data.category)
     }

     if(data.subcat1 && data.subcat1!="") 
     {parentId=data.subcat1
      level=3
      connectCat.push(data.subcat1)

     }
     if(data.subcat2 && data.subcat2!="") 
     {parentId=data.subcat2
      level=4
      connectCat.push(data.subcat2)

     }


      const users = await CATEGORY.create({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        companyId: req.companyId,
        level:level,
        connectedCat:JSON.stringify(connectCat),
        parentId :parentId
    

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


app.post('/update',superAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.pcategory,data.category,data.serviceId,data.serviceName])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var icon=""
    var thumbnail=""

    if (req.files) {

      ImageFile = req.files.icon;    
      if(ImageFile)
      {
         icon = Date.now() + '_' + ImageFile.name;

      ImageFile.mv(config.UPLOAD_DIRECTORY +"services/icons/"+ icon, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });

    }
    
      ImageFile1 = req.files.thumbnail;    
      if(ImageFile1)
      {
      thumbnail = Date.now() + '_' + ImageFile1.name;
      ImageFile1.mv(config.UPLOAD_DIRECTORY +"services/thumbnails/"+ thumbnail, function (err) {
          //upload file
          if (err)
          return responseHelper.error(res, err.message, 400);   
      });
    }
      }


    const user = await CATEGORY.findOne({
      attributes: ['id'],

      where: {
        id: data.serviceId

      }
    });




    if (user) {
    
      if(icon=="") icon=user.dataValues.icon
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail
      var parentId=0
      var level=1
    var connectCat=[data.pcategory]

      if(data.category && data.category!=""){ parentId=data.category
     level=2
     connectCat.push(data.category)
      }
 
      if(data.subcat1 && data.subcat1!="") 
      {parentId=data.subcat1
       level=3
       connectCat.push(data.subcat1)
 
      }
      if(data.subcat2 && data.subcat2!="") 
      {parentId=data.subcat2
       level=4
       connectCat.push(data.subcat2)
 
      }
      const users = await CATEGORY.update({
        name: data.serviceName,
        description: data.description,
        icon: icon,
        thumbnail: thumbnail,
        level:level,
        connectedCat:JSON.stringify(connectCat),
        parentId :parentId

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









app.get('/view',superAuth,async(req,res,next) => { 
  
  var id=req.query.id
  var parent=req.query.parent
  var name=req.query.name

  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"subcategory?id="+parent+"&name="+name);
}
      const findData = await CATEGORY.findOne({
      where :{id: id },
      });
   

      var cdata= await  commonMethods.getAllParentCategories(req.companyId)
      return res.render('super/subcategory/viewSubcategory.ejs',{data:findData,parData:cdata});



    } catch (e) {
      
      req.flash('errorMessage',appstrings.no_record)
      return res.redirect(superadminpath+"subcategory/view?id="+id+"&parent="+parent+"&name="+name);
    }


 
});



app.get('/delete',superAuth,async(req,res,next) => { 
   var id=req.query.id
   var parent=req.query.parent
   var name=req.query.name

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(superadminpath+"subcategory?id="+parent+"&name="+name);
}

  try{

        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await CATEGORY.destroy({
          where: {
            id: id
          }
          })  
            

          if(numAffectedRows>0)
          {
           req.flash('successMessage',appstrings.delete_success)
          return res.redirect(superadminpath+"subcategory?id="+parent+"&name="+name);

          }

          else {
            req.flash('errorMessage',appstrings.no_record)
            return res.redirect(superadminpath+"subcategory?id="+parent+"&name="+name);
          }

        }catch (e) {
          //return responseHelper.error(res, e.message, 400);
          req.flash('errorMessage',e.message)
          return res.redirect(superadminpath+"subcategory?id="+parent+"&name="+name);
        }
});




module.exports = app;

//Edit User Profile
