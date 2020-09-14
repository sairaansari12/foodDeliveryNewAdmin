const NOTIFICATION=db.models.notifications

const sequelize = require('sequelize')
 var cron = require('node-cron');
 var moment = require('moment')
 const Op = require('sequelize').Op;
 const groupa = db.models.groups;
const groupMembers = db.models.groupMembers;
const chatMessages = db.models.chatMessages;
const textMessages = db.models.textMessages;
const mediaMessages = db.models.mediaMessages;

 var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: 465,
    secure: true, // use SSL
    //service: 'gmail',
    auth: {
        user: config.EMAIL_KEY,
        pass: config.EMAIL_PASS
    }
});



cron.schedule('30 06 * * *',  async() => {
   console.log('running a task every 6:30 AM ');
   var days=['sun','mon','tue','wed','thu','fri','sat']

   var dayCount=days[new Date().getDay()]
  try {
    var findData = await SCHEDULE.findAll({where: {dayParts:{[Op.not]: dayCount}}});
    findData=JSON.parse(JSON.stringify(findData))

  for(var t=0;t<findData.length;t++)
  {
    SCHEDULE.update(
     {slots: findData[t].permanentSlots},
      {where: {id:findData[t].id}});
 }
//Delete older Notifications
  NOTIFICATION.destroy({where: {  createdAt: {[Op.lte]: moment().subtract(7, 'days').toDate()}}
  });
//delete user admin chat history if last chat time is greater than a week
deleteChatMsgs();

//UPDate Vendors rating
updateVendorsRating()

//Update Servcice RATINGS
updateServiceRating()

//UPdate Popularity

updateServicePopularity()

//Update Tiffin Popularity
updateServiceTiffinPopularity()

////Update Tiffin Popularity
updateTiffinRating()

updateEmpRating()
updateEmpPopularity()
updateRestroPopularity()


  } catch (e) {
    console.error(e.message)
  }

  });
   
  // cron.schedule('* * * * *',  async() => {
  //   console.log('running a task every 360 Mins ')
  //   updateRestroPopularity()
   
  // });

  cron.schedule('* */360 * * *',  async() => {
    console.log('running a task every 360 Mins ');
    try{
      var newDate = moment(new Date()).format("YYYY/MM/DD hh:mm:ss");


      var services = await SERVICES.findAll({
        attributes: ['id','name','icon','thumbnail','validUpto','offer','offerName','price','originalPrice'],
        where: {
                 status: 1,
                 validupto: {
                  [Op.lt]: newDate
                },
               
        },
        order: [
          ['offer','DESC']
        ]
      })


      services=JSON.parse(JSON.stringify(services))
      for(var p=0;p<services.length;p++)
      {
      
        SERVICES.update( {price:services[p].originalPrice,
          offer: 0,offerName:'',validUpto:null},
          {where: {id: services[p].id}})
   
        }


    
   } catch (e) {
     console.error(e.message)
   }
 
   }); 



// cron.schedule('* * * * *', () => {
//   var newDate = moment(new Date()).subtract(10,'days');

//   console.log('Runing a job at 01:0`0 at America/Sao_Paulo timezone',newDate);
 
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// });


//Recent Added Company ande product Ratings
 

async function updateServiceRating()
{

  var products =  await SERVICERATINGS.findAll({
    attributes: ['serviceId'],
    group:['serviceId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getServiceAvgRating(products[k].serviceId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


SERVICES.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].serviceId
  }
  });
  
}
    }
  }

  async function updateEmpRating()
{

  var products =  await STAFFRATINGS.findAll({
    attributes: ['empId'],
    group:['empId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getEmpAvgRating(products[k].empId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


EMPLOYEE.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].empId
  }
  });
  
}
    }
  }

        
  async function updateTiffinRating()
{

  var products =  await TIFFRATINGS.findAll({
    attributes: ['tiffinId'],
    group:['tiffinId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  
  
  
 
  if(products && products.length>0) 
    {
      products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var rating=0
          var count=0
  
  var dataRating= await commonMethods.getTiffinAvgRating(products[k].tiffinId)
  if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
  {rating=dataRating.dataValues.totalRating
    count=dataRating.dataValues.totalNoRating
   }


TIFFSERVICES.update({
    rating: rating,
    totalRatings: count
  },
  {
    where : {
    id: products[k].tiffinId
  }
  });
  
}
    }
  }

    


async function updateServicePopularity()
{

  var products =  await SUBORDERS.findAll({
    attributes: ['serviceId'],
    group:['serviceId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await SUBORDERS.findOne({attributes:['serviceId', [sequelize.fn('COUNT', sequelize.col('serviceId')), 'count']],where:{serviceId:products[k].serviceId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  

  SERVICES.update(
      
    {
      popularity: popularityD},
   { where: {id:products[k].serviceId}
    
  }
    ) 
        }
  
    
}


async function updateEmpPopularity()
{

  var products =  await ASSIGNMENT.findAll({
    attributes: ['empId'],
    group:['empId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await ASSIGNMENT.findOne({attributes:['empId', [sequelize.fn('COUNT', sequelize.col('empId')), 'count']],where:{empId:products[k].empId,jobStatus:[1,3]}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    

  EMPLOYEE.update(

    {
      totalOrders: popularityD},
   { where: {id:products[k].empId}
    
  }
    ) 
        }
  
    
}

async function updateServiceTiffinPopularity()
{

  var products =  await TIFFORDERS.findAll({
    attributes: ['tiffinId'],
    group:['tiffinId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  

  
 products=JSON.parse(JSON.stringify(products))

  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
  
  var dataPop= await TIFFORDERS.findOne({attributes:['id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],where:{tiffinId:products[k].tiffinId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  

  TIFFSERVICES.update(
      
    {
      popularity: popularityD},
   { where: {id:products[k].tiffinId}
    
  }
    ) 
        }
  
    
}


async function updateVendorsRating()
{
  //RECENT added Ratings
  var vendors =  await COMPANYRATING.findAll({
    attributes: ['companyId'],
    group:['companyId'],

  where: {
    createdAt: {[Op.gte]: moment().subtract(2, 'days').toDate()}}
  })
  

  if(vendors) 
  {
    vendors=JSON.parse(JSON.stringify(vendors))

for(var k=0;k<vendors.length;k++)
      {
        var rating=0
        var fQlRating=0
        var ppRating=0
        var fQnRating=0
        var count=0

var dataRating= await commonMethods.getCompAvgRating(vendors[k].companyId)
if(dataRating && dataRating.dataValues && dataRating.dataValues.totalRating) 
{rating=dataRating.dataValues.totalRating
  count=dataRating.dataValues.totalNoRating
  fQlRating=dataRating.dataValues.foodQuality 
  fQnRating=dataRating.dataValues.foodQuantity 
  ppRating=dataRating.dataValues.packingPres
}
 COMPANY.update({
  rating: rating,
  foodQualityRating: fQlRating,
  foodQuantityRating: fQnRating,
  packingPresRating: ppRating,
  totalRatings: count,
},
{
  where : {
  id: vendors[k].companyId
}
});


      }

  }






}


async function updateRestroPopularity()
{

  var products =  await ORDERS.findAll({
    attributes: ['companyId'],
    group:['companyId'],
  where: {
    createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
  })
  
  
 products=JSON.parse(JSON.stringify(products))
  
  for(var k=0;k<products.length;k++)
        {
          var popularityD=0
          var popularityD24=0

  var dataPop= await ORDERS.findOne({attributes:['companyId', [sequelize.fn('COUNT', sequelize.col('companyId')), 'count']],where:{companyId:products[k].companyId}})
  if(dataPop && dataPop.dataValues && dataPop.dataValues.count) 
  popularityD=parseInt(dataPop.dataValues.count)
    
  
  var dataPop24= await ORDERS.findOne({attributes:['companyId', [sequelize.fn('COUNT', sequelize.col('companyId')), 'count']],
  where:{companyId:products[k].companyId, createdAt: {[Op.gte]: moment().subtract(1, 'days').toDate()}}
})
if(dataPop24 && dataPop24.dataValues && dataPop24.dataValues.count) 
  popularityD24=parseInt(dataPop24.dataValues.count)



  COMPANY.update(
      
    {
      totalOrders: popularityD,
      totalOrders24: popularityD24

    },
   { where: {id:products[k].companyId}
    
  }
    ) 
        }
  
    
}
async function deleteChatMsgs(){
  const groups= await groupa.findAll({
    attributes: ['id']
  });  
  if(groups){
    groups.map(async group=>{
      var message = await chatMessages.findOne({ 
        attributes: ['id'],
        where: {
          [Op.and]: [
            {
              groupId: group.id
            },
            {
              createdAt: {[Op.lte]: moment().subtract(7, 'days').toDate()},
            }
          ]
         },
         order: [
           ['createdAt', 'DESC']
          ],
      });
      if(message){
        chatMessages.destroy({
          where:{
            groupId : group.id
          }
        })
      }
    });
  } 
}


//PRODUCT RATINGS








