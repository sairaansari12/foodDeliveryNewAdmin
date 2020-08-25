
const express = require('express');
const app     = express();

const SCHEDULE = db.models.schedule
const Op = require('sequelize').Op;
//SERVICES.belongsTo(SERVICES,{as: 'category',foreignKey: 'parentId'})


app.get('/',superAuth, async (req, res, next) => {
    
    try {
        const findData = await SCHEDULE.findOne({
        where :{companyId :req.companyId},
        });
     

        return res.render('super/schedule/viewSchedule.ejs',{data:findData});



      } catch (e) {
        return responseHelper.error(res, e.message, 400);
      }


});

app.post('/getSlots',superAuth, async (req, res, next) => {
  var data=req.body
  let responseNull= commonMethods.checkParameterMissing([data.dayParts])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  try {
      const findData = await SCHEDULE.findOne({
      where :{companyId :req.companyId,dayParts:data.dayParts},
      });
   

      responseHelper.post(res, appstrings.success, findData,200);



    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }


});




app.post('/addupdate',superAuth,async (req, res) => {
  try {
    const data = req.body;
    var slots=[]
    var slotsRemaining=[]


    let responseNull= commonMethods.checkParameterMissing([data.slotsTime,data.slotsQuantity,data.turnaround])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

   if(typeof data.slotsTime=='string') {
     
    data.slotsTime=[data.slotsTime]
    data.slotsQuantity=[data.slotsQuantity]
    data.slotsQuantity1=[data.slotsQuantity1]

   }

    
    for(var k=0;k<data.slotsTime.length;k++ )
    {
    var slot=data.slotsTime[k]
    var qua=data.slotsQuantity[k]
    slots.push({'slot': slot,'bookings' :qua})
    slotsRemaining.push({'slot': slot,'bookings' :data.slotsQuantity1[k]})

    }

   if(data.checkedMonFri) {
    addupate('mon',data,slots,slotsRemaining,req,res)
   addupate('tue',data,slots,slotsRemaining,req,res)
   addupate('wed',data,slots,slotsRemaining,req,res)
   addupate('thu',data,slots,slotsRemaining,req,res)
   addupate('fri',data,slots,slotsRemaining,req,res)
  }
  
  else     addupate(data.dayParts,data,slots,slotsRemaining,req,res)

  responseHelper.post(res, appstrings.success, null,200);


  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})



async function addupate(dayParts,data,slots,slotsRemaining,req,res)
{

  console.log(slots)
  console.log(slotsRemaining)

  try{


  const user = await SCHEDULE.findOne({
    where: {
      companyId: req.companyId,
      dayParts: dayParts
    }
  });


  if (!user) {

  

    const users = await SCHEDULE.create({
      slots: JSON.stringify(slotsRemaining),
      permanentSlots: JSON.stringify(slots),
      dayParts:dayParts,
      turnaround: data.turnaround,
      startTime: data.startTime,
      endTime: data.endTime,
      companyId: req.companyId
     });

  }
    else  
    {
      const users = await SCHEDULE.update({
        slots: JSON.stringify(slotsRemaining),
        turnaround: data.turnaround,
        permanentSlots: JSON.stringify(slots),
        dayParts:dayParts,
        startTime: data.startTime,
        endTime: data.endTime,
        companyId: req.companyId
       },
       {where: {id:user.dataValues.id}}
       
       );
      // responseHelper.post(res, appstrings.success, null,200);



    }
  }
  catch(e)
  {
    responseHelper.error(res, e.message,null);

  }

}

module.exports = app;

//Edit User Profile
