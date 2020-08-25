
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const fs = require('fs');

const excel = require('node-excel-export');
const xlsxFile = require('read-excel-file/node');




    
  
  app.post('/',adminAuth,async(req,res) => {

    var params=req.body
    var search=""
var where={companyId: req.companyId,categoryId:params.categoryId,productType:1}
    if(params.search && params.search!="")
where={

  [Op.or]: [
    {name: {[Op.like]: `%${params.search}%`}},
    {description: { [Op.like]: `%${params.search}%` }
  }
  ],
  companyId: req.companyId,categoryId:params.categoryId,
  productType:1

}

    let responseNull=  commonMethods.checkParameterMissing([params.categoryId])
        if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
       
        try{
    const products = await SERVICES.findAll({
        where: where,
       
    },
    { order: [['createdAt', 'DESC']] }
    );

    return responseHelper.post(res, appstrings.success,products,200);


  


      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});


app.post('/export',adminAuth,async (req, res, next) => {


  const styles = {
    headerDark: {
      fill: {
        fgColor: {
          rgb: 'FF000000'
        }
      },
      font: {
        color: {
          rgb: 'FFFFFFFF'
        },
        sz: 14,
        bold: true,
        underline: true
      }
    },
    cellPink: {
      fill: {
        fgColor: {
          rgb: 'FFFFCCFF'
        }
      }
    }
  };

try{
  var services = await SERVICES.findAll({where:{companyId:req.id},
include:[{model:CATEGORY , required:true,as:'category',attributes:['id','name']}]

})

  
  var dataset=[]
  for(var k=0;k<services.length;k++)
  {
 dataset.push( 
    {
      categoryId:services[k].categoryId,categoryName:services[k].category.name,
      
      name:services[k].name,itemType:services[k].itemType, description:services[k].description, duration:services[k].duration,
      price:services[k].price,  originalPrice:services[k].originalPrice, 
      offerName:services[k].offerName,  offer:services[k].offer, validUpto:services[k].validUpto,
      includedServices:services[k].includedServices, excludedServices:services[k].excludedServices,
    
      status:services[k].status,
      rating:services[k].rating,
      totalRatings:services[k].totalRatings,
      popularity:services[k].popularity,
    
    
    
    })
    
 }
   
  const specification = {

    categoryName: {
      displayName: 'Cateory Name',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

    categoryId: {
      displayName: 'Category Id',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

    name: {
      displayName: 'Product Name',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

    itemType: {
      displayName: 'Product Type',
      headerStyle: styles.headerDark,
      cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
        return (value == 1) ? 'Non-Veg' : 'Veg';
      },
      width: '15' // <- width in chars (when the number is passed as string)
    },

   

    duration: {
      displayName: 'Duration',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },

    originalPrice: {
      displayName: 'Price',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },

    offer: {
      displayName: 'Offer(%)',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },

    offerName: {
      displayName: 'Offer Name',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },
 

    validUpto: {
      displayName: 'Offer Expiry',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },

    price: {
      displayName: 'Price after discount',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

    description: {
      displayName: 'Description',
      headerStyle: styles.headerDark,
      width: '100'
    },
    
    includedServices: {
      displayName: 'included Services',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

    excludedServices: {
      displayName: 'Excluded Services',
      headerStyle: styles.headerDark,
      width: '25' // <- width in chars (when the number is passed as string)
    },

  
    status: {
      displayName: 'Status',
      headerStyle: styles.headerDark,
      cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
        return (value == 1) ? 'Active' : 'Inactive';
      },
      width: '10' // <- width in chars (when the number is passed as string)
    },

    rating: {
      displayName: 'Rating',
      headerStyle: styles.headerDark,
      width: '10' // <- width in chars (when the number is passed as string)
    },
    totalRatings: {
      displayName: 'Total Ratings',
      headerStyle: styles.headerDark,
      width: '10' // <- width in chars (when the number is passed as string)
    },
    popularity: {
      displayName: 'Popularity',
      headerStyle: styles.headerDark,
      width: '15' // <- width in chars (when the number is passed as string)
    },



  }


  const report = excel.buildExport(
    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
      {
        name: 'Report', // <- Specify sheet name (optional)
        specification: specification, // <- Raw heading array (optional)
        data: dataset // <-- Report data
      }
    ]
  );


  //res.attachment('/report.xlsx'); // This is sails.js specific (in general you need to set headers)


  fs.writeFile(config.UPLOAD_DIRECTORY+"assets/docs/report.xlsx",report, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 
 
 return responseHelper.post(res, appstrings.success, null);

  

    }
    catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }

});


app.post('/import',adminAuth,async (req, res, next) => {
//var cId="25cbf58b-46ba-4ba2-b25d-8f8f653e9f11"
var cId=req.id

var error=0
  
try{
 
  var file=""

  if (req.files) {
    var ImageFile1 = req.files.importFile;    
    if(ImageFile1)
    {
      file = "uploadFile.xlsx";
    ImageFile1.mv(config.UPLOAD_DIRECTORY +"assets/docs/"+ file, function (err) {
        //upload file
        if (err)
        return responseHelper.error(res, err.message, 400);   

    if(file=="")
    return responseHelper.post(res, appstrings.no_meadia, null);

    else{


      var dataPush=[]
    xlsxFile(fs.createReadStream(config.UPLOAD_DIRECTORY +"assets/docs/"+ file)).then(async (rows) => {

var allNames=[]
      for(var k=1;k<rows.length;k++)
     {
   var dataRow=rows[k]
      if(!allNames.includes(dataRow[2])) allNames.push(dataRow[2])    

     

     }

    // console.log(allNames)

     var dataExist= await SERVICES.findAll({
       attributes:['name','id'],
      where:{
         name: { [Op.in]: allNames },
         companyId: cId
      } 
    });

    var dataex = dataExist.map(user => user.name);


     for(var k=1;k<rows.length;k++)
     {
      var data=rows[k]

      var itemType=((data[3]+"").toLowerCase()=='veg') ?"0" :"1"
      var status=((data[13]+"").toLowerCase()=='active') ?"1" :"0"
      dataPush={categoryId:data[1],
        categoryId:data[1],
        name:data[2],
        itemType:itemType,
        duration:data[4],
        originalPrice:(data[5]!=null)?data[5]:0,
        offer:(data[6]!=null)?data[6]:0,
        offerName:(data[7]!=null)?data[7]:"",
        validUpto:data[8],
        price:data[9],
        description:(data[10]!=null)?data[10]:"",
      incluedServices:data[11],
      excludedServices:data[12],
      status:status,
      companyId:cId,
      rating:(data[14]!=null)?data[14]:0,
      totalRatings:(data[15]!=null)?data[15]:0,
      popularity:(data[16]!=null)?data[16]:0

      
      
      }
     
     


        
       if(dataex.includes(data[2])==false)  {
        dataex.push(data[2])
        SERVICES.create(dataPush).then(res=>{
        }).catch(err=>{
        console.log(err.message)
         error++;

        })
      
      
    

        
      
      }
    
      if(k==rows.length-1)
      {
        if(error==0) return responseHelper.post(res, appstrings.import_success, null);
    
        else return responseHelper.post(res, appstrings.some_entries_wrong,null, 200);
    
        
      }
  
    
    }


    
  }).catch(e=> {
    return responseHelper.error(res, e.message, 400);

  });



}
});

 
}
  

    }
  }
    catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }

});



app.post('/list',adminAuth,async (req, res, next) => {

  var params=req.body
  
   var lat=0
   var lng=0
   var page =1
   var limit =20
   var itemType=['0','1']
   var orderby='createdAt'
   var orderType='ASC'

   if(params.itemType && params.itemType!="") itemType=[params.itemType]
   if(params.lat) lat=parseFloat(params.lat)
   if(params.lng) lng=parseInt(params.lng)
   if(params.orderByInfo &&   params.orderByInfo.orderby) {
    orderby=params.orderByInfo.orderby
    orderType=params.orderByInfo.orderType

  }


  if(params.page) page=params.page

  if(params.limit)
   limit=parseInt(params.limit)
   var offset=(page-1)*limit

   var where= {
    companyId:req.companyId,
    itemType:  {[Op.or]: itemType},
    productType:1
    
    }

    


    if(params.search && params.search!="")
    {

     where={ [Op.or]: [
        {name: {[Op.like]: `%${params.search}%`}},
        {description: { [Op.like]: `%${params.search}%` }},
        {price: { [Op.like]: `%${params.search}%` }
      }
      ],
      companyId: req.companyId,
      itemType:  {[Op.or]: itemType},
      productType:1
    }

  }
    
  

      


    try{


      var services = await SERVICES.findAndCountAll({
        where: where,
      order: [[orderby,orderType]],
      offset:offset,limit:limit,

      })



      return responseHelper.post(res, appstrings.success, services);

  

    }
    catch (e) {
      console.log(e)
      return responseHelper.error(res, e.message, 400);
    }

});




app.get('/',adminAuth, async (req, res, next) => {
  try {
    
     return res.render('admin/products/productListing.ejs',{});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});


app.get('/add',adminAuth, async (req, res, next) => {
    
  try{
    var cdata= await commonMethods.getAllCategories(req.companyId)
    var pdata= await commonMethods.getAllParentCategories(req.companyId)

    return res.render('admin/products/addProduct.ejs',{catData:cdata,parData: pdata});

    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});

app.get('/edit/:id',adminAuth,async(req,res,next) => { 
  
  var id=req.params.id
  try {

  let responseNull=  common.checkParameterMissing([id])
  if(responseNull) 
  { req.flash('errorMessage',appstrings.required_field)
  return res.redirect(adminpath+"products/");
}
      var findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id }
      

  
      });
      

      return res.render('admin/products/editProduct.ejs',{data:findData});
      



      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"products/");
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
             console.log(e)
             return responseHelper.error(res, e.message, 400);
           }
    
    
    
});


app.post('/add',adminAuth,async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceName,data.itemtype,data.duration,data.originalPrice,data.price,data.categoryId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {
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
      var validUpto=null
      var offer=0

      if(data.validUpto && data.validUpto!="") validUpto=data.vaidUpto
      if(data.offer && data.offer!="") offer=data.offer

      const users = await SERVICES.create({
        name: data.serviceName,
        description: data.description,
        itemType: data.itemtype,
        price: data.price,
        duration: data.duration,
        icon: thumbnail,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        companyId: req.companyId,
        categoryId :data.categoryId,
        offer :offer,
        offerName :data.offerName,
        originalPrice :data.originalPrice,
        validUpto :validUpto,


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


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.serviceName,data.itemtype,data.duration,data.price])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    var thumbnail=""

    if (req.files) {

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
    
      if(thumbnail=="") thumbnail=user.dataValues.thumbnail

      var validUpto=null
      var offer=0

      if(data.validUpto && data.validUpto!="") validUpto=data.vaidUpto
      if(data.offer && data.offer!="") offer=data.offer
      const users = await SERVICES.update({
        name: data.serviceName,
        description: data.description,
        itemType: data.itemtype,
        price: data.price,
        duration: data.duration,
        icon: thumbnail,
        thumbnail: thumbnail,
        includedServices:data.includedServices,
        excludedServices:data.excludedServices,
        offer :offer,
        offerName :data.offerName,
        originalPrice :data.originalPrice,
        validUpto :validUpto,

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
  return res.redirect(adminpath+"products/");
}
      var findData = await SERVICES.findOne({
      where :{companyId :req.companyId, id: id }
      

  
      });
      dataAddons=[]

    if(findData) {
      findData=JSON.parse(JSON.stringify(findData))
if(findData.addOnIds && findData.addOnIds!="")
       dataAddons=await SERVICES.findAll({
        attributes: ['id','name','productType','description','price','icon','thumbnail','type','price','duration','includedServices','excludedServices','createdAt','status','originalPrice','offer','offerName','rating','totalRatings','popularity'],
         where: {
          id: { [Op.or]: findData.addOnIds},
         }
       });


   

      return res.render('admin/products/viewProduct.ejs',{data:findData,addOns:dataAddons});
      }


        return res.redirect(adminpath+"products/");

      


    } catch (e) {
      console.log(e)
      req.flash('errorMessage',e.message)
      return res.redirect(adminpath+"products/");
    }


 
});





app.post('/delete',adminAuth,async(req,res,next) => { 
   

  let responseNull=  common.checkParameterMissing([req.body.id])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



  try{
        //console.log(pool.format('DELETE FROM `reminders` WHERE `reminder_id` = ?', [req.params.id]));
        const numAffectedRows = await SERVICES.destroy({
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
           // return res.redirect(adminpath+"category");
          }

        }catch (e) {
          return responseHelper.error(res, e.message, 400);
          //req.flash('errorMessage',appstrings.no_record)
          //return res.redirect(adminpath+"category");
        }
});



app.post('/newAddOn',async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.addOnId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    var user = await SERVICES.findOne({
      attributes: ['addOnIds','id'],

      where: {
        id: data.serviceId,

      }
    });


    if (user) {
      user=JSON.parse(JSON.stringify(user))
      var dataIds=user.addOnIds
      if(!dataIds.includes(data.addOnId)) dataIds.push(data.addOnId)





await SERVICES.update(
  {addOnIds: JSON.stringify(dataIds)},
   {where: {id:data.serviceId}});

responseHelper.post(res, appstrings.success, null,200);
       
      }


    
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})


app.post('/removeAddOn',async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.serviceId,data.addOnId])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);



    var user = await SERVICES.findOne({
      attributes: ['addOnIds','id'],

      where: {
        id: data.serviceId,

      }
    });


    if (user) {
      user=JSON.parse(JSON.stringify(user))
      var dataIds=user.addOnIds
      var newIds=[]
for(var k=0;k<dataIds.length;k++)
{
if(dataIds[k]!=data.addOnId)
newIds.push(dataIds[k])
}




await SERVICES.update(
  {addOnIds: JSON.stringify(newIds)},
   {where: {id:data.serviceId}});

responseHelper.post(res, appstrings.update_success, null,200);
       
      }


    
      else  responseHelper.error(res, appstrings.no_record, 400);

    

  } catch (e) {
    console.log(e)
    return responseHelper.error(res, e.message,400);
  }

})




module.exports = app;

//Edit User Profile
