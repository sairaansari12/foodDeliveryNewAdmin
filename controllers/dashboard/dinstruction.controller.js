
const express = require('express');
const app     = express();
const Op = require('sequelize').Op;
const ORDERS= db.models.orders
const SUBORDERS=db.models.suborders
const SERVICES = db.models.services
const USER = db.models.users

/////////////////////////////////////////////////////////
////////// Delivery Instruction ////////////////////////
////////////////////////////////////////////////////////

app.get('/delivery',adminAuth, async (req, res, next) => {
  try {
      const findData = await INSTRUCTIONS.findOne({
        where: {
          companyId: req.companyId,
        }
      });
      if(findData){
        if(findData.dataValues.deliveryInstructions != ""){
           var inst = JSON.parse(findData.dataValues.deliveryInstructions);
        }else{
          var inst = [];
        }
       
      }else{
        var inst = [];
      }
      return res.render('admin/ordersetting/delivery.ejs',{inst});
    } catch (e) {
      return responseHelper.error(res, e.message, 400);
    }
});

/**
*@role Add New Delivery Instruction
*/
app.post('/addInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    if(findData){
      var total = 0;
      if(findData.dataValues.deliveryInstructions != ""){
        var inst = JSON.parse(findData.dataValues.deliveryInstructions);
        var total = inst.length;
        for (var i = 0; i < inst.length; i++) {
          var array         = {};
          var id            = i+1;
          var heading       = inst[i].heading;
          var instu         = inst[i].instruction;
          array.id          = id;
          array.heading     = heading;
          array.instruction = instu;
          mainArray.push(array);
        }
        
      }
      var newinst = {};
      newinst.id = total + 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      console.log(mainArray);
      //Update Instruction
      const users = await INSTRUCTIONS.update({
        deliveryInstructions: JSON.stringify(mainArray)
      },
      {
        where: {
          companyId: req.companyId
        }
      });
    }else{
      var newinst = {};
      newinst.id = 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      //Update Instruction
      const users = await INSTRUCTIONS.create({
        deliveryInstructions: JSON.stringify(mainArray),
        companyId: req.companyId
      });
    }
    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/**
*@role Delete Delivery Instruction
*/
app.get('/delete/:id',adminAuth,async(req,res,next) => { 
   
  try{
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    var total     = 0;
    var inst      = JSON.parse(findData.dataValues.deliveryInstructions);
    var total     = inst.length;
    var j = 1;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var heading       = inst[i].heading;
      var instu         = inst[i].instruction;
      if(parseInt(inst[i].id) != parseInt(req.params.id))
      {
        array.id          = j;
        array.heading     = heading;
        array.instruction = instu;
        mainArray.push(array);
        j++;
      }
    }
    console.log(mainArray);
    //Update Instruction
    if(mainArray.length > 0)
    {
      var totalinst = JSON.stringify(mainArray);
    }else{
      var totalinst = "";
    }
    const users = await INSTRUCTIONS.update({
      deliveryInstructions: totalinst
    },
    {
      where: {
        companyId: req.companyId
      }
    });
     req.flash('successMessage',appstrings.delete_success)
    return res.redirect(adminpath+"ordersetting/delivery");
  }catch (e) {
    //return responseHelper.error(res, e.message, 400);
    req.flash('errorMessage',appstrings.no_record)
    return res.redirect(adminpath+"offers");
  }
});

/**
*@role Update Pickup Instruction
*/
app.post('/delivery/updateInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
   
    var total = 0;
    var inst = JSON.parse(findData.dataValues.deliveryInstructions);
    var total = inst.length;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var id            = i+1;
      if(data.istid == inst[i].id)
      {
        var heading       = data.nameedit;
        var instu         = data.editinstruction;
      }else{
        var heading       = inst[i].heading;
        var instu         = inst[i].instruction;
      }
      array.id          = id;
      array.heading     = heading;
      array.instruction = instu;
      mainArray.push(array);
    }
    
    //Update Instruction
    const users = await INSTRUCTIONS.update({
      deliveryInstructions: JSON.stringify(mainArray)
    },
    {
      where: {
        companyId: req.companyId
      }
    });

    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/////////////////////////////////////////////////////////
////////// Cooking Instruction ////////////////////////
////////////////////////////////////////////////////////

app.get('/cooking',adminAuth, async (req, res, next) => {
  try {
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    if(findData){
      if(findData.dataValues.cookingInstructions != ""){
         var inst = JSON.parse(findData.dataValues.cookingInstructions);
      }else{
        var inst = [];
      }
     
    }else{
      var inst = [];
    }
    return res.render('admin/ordersetting/cooking.ejs',{inst});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

/**
*@role Delete Cooking Instruction
*/
app.get('/cooking/delete/:id',adminAuth,async(req,res,next) => { 
   
  try{
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    var total     = 0;
    var inst      = JSON.parse(findData.dataValues.cookingInstructions);
    var total     = inst.length;
    var j = 1;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var heading       = inst[i].heading;
      var instu         = inst[i].instruction;
      if(parseInt(inst[i].id) != parseInt(req.params.id))
      {
        array.id          = j;
        array.heading     = heading;
        array.instruction = instu;
        mainArray.push(array);
        j++;
      }
    }
    console.log(mainArray);
    //Update Instruction
    if(mainArray.length > 0)
    {
      var totalinst = JSON.stringify(mainArray);
    }else{
      var totalinst = "";
    }
    const users = await INSTRUCTIONS.update({
      cookingInstructions: totalinst
    },
    {
      where: {
        companyId: req.companyId
      }
    });
    req.flash('successMessage',appstrings.delete_success)
    return res.redirect(adminpath+"ordersetting/cooking");
  }catch (e) {
    //return responseHelper.error(res, e.message, 400);
    req.flash('errorMessage',appstrings.no_record)
    return res.redirect(adminpath+"ordersetting/cooking");
  }
});

/**
*@role Add New Delivery Instruction
*/
app.post('/cooking/addInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    if(findData){
      var total = 0;
      if(findData.dataValues.cookingInstructions != ""){
        var inst = JSON.parse(findData.dataValues.cookingInstructions);
        var total = inst.length;
        for (var i = 0; i < inst.length; i++) {
          var array         = {};
          var id            = i+1;
          var heading       = inst[i].heading;
          var instu         = inst[i].instruction;
          array.id          = id;
          array.heading     = heading;
          array.instruction = instu;
          mainArray.push(array);
        }
        
      }
      var newinst = {};
      newinst.id = total + 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      console.log(mainArray);
      //Update Instruction
      const users = await INSTRUCTIONS.update({
        cookingInstructions: JSON.stringify(mainArray)
      },
      {
        where: {
          companyId: req.companyId
        }
      });
    }else{
      var newinst = {};
      newinst.id = 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      //Update Instruction
      const users = await INSTRUCTIONS.create({
        cookingInstructions: JSON.stringify(mainArray),
        companyId: req.companyId
      });
    }
    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/**
*@role Update Pickup Instruction
*/
app.post('/cooking/updateInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
   
    var total = 0;
    var inst = JSON.parse(findData.dataValues.cookingInstructions);
    var total = inst.length;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var id            = i+1;
      if(data.istid == inst[i].id)
      {
        var heading       = data.nameedit;
        var instu         = data.editinstruction;
      }else{
        var heading       = inst[i].heading;
        var instu         = inst[i].instruction;
      }
      array.id          = id;
      array.heading     = heading;
      array.instruction = instu;
      mainArray.push(array);
    }
    
    //Update Instruction
    const users = await INSTRUCTIONS.update({
      cookingInstructions: JSON.stringify(mainArray)
    },
    {
      where: {
        companyId: req.companyId
      }
    });

    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/////////////////////////////////////////////////////////
////////// Pick Up Instruction ////////////////////////
////////////////////////////////////////////////////////

app.get('/pickup',adminAuth, async (req, res, next) => {
  try {
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    if(findData){
      if(findData.dataValues.pickupInstructions != ""){
         var inst = JSON.parse(findData.dataValues.pickupInstructions);
      }else{
        var inst = [];
      }
     
    }else{
      var inst = [];
    }
    return res.render('admin/ordersetting/pickup.ejs',{inst});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

/**
*@role Delete PickUp Instruction
*/
app.get('/pickup/delete/:id',adminAuth,async(req,res,next) => { 
   
  try{
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    var total     = 0;
    var inst      = JSON.parse(findData.dataValues.pickupInstructions);
    var total     = inst.length;
    var j = 1;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var heading       = inst[i].heading;
      var instu         = inst[i].instruction;
      if(parseInt(inst[i].id) != parseInt(req.params.id))
      {
        array.id          = j;
        array.heading     = heading;
        array.instruction = instu;
        mainArray.push(array);
        j++;
      }
    }
    console.log(mainArray);
    //Update Instruction
    if(mainArray.length > 0)
    {
      var totalinst = JSON.stringify(mainArray);
    }else{
      var totalinst = "";
    }
    const users = await INSTRUCTIONS.update({
      pickupInstructions: totalinst
    },
    {
      where: {
        companyId: req.companyId
      }
    });
    req.flash('successMessage',appstrings.delete_success)
    return res.redirect(adminpath+"ordersetting/pickup");
  }catch (e) {
    //return responseHelper.error(res, e.message, 400);
    req.flash('errorMessage',appstrings.no_record)
    return res.redirect(adminpath+"ordersetting/pickup");
  }
});

/**
*@role Add New Pickup Instruction
*/
app.post('/pickup/addInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
    if(findData){
      var total = 0;
      if(findData.dataValues.pickupInstructions != ""){
        var inst = JSON.parse(findData.dataValues.pickupInstructions);
        var total = inst.length;
        for (var i = 0; i < inst.length; i++) {
          var array         = {};
          var id            = i+1;
          var heading       = inst[i].heading;
          var instu         = inst[i].instruction;
          array.id          = id;
          array.heading     = heading;
          array.instruction = instu;
          mainArray.push(array);
        }
        
      }
      var newinst = {};
      newinst.id = total + 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      console.log(mainArray);
      //Update Instruction
      const users = await INSTRUCTIONS.update({
        pickupInstructions: JSON.stringify(mainArray)
      },
      {
        where: {
          companyId: req.companyId
        }
      });
    }else{
      var newinst = {};
      newinst.id = 1;
      newinst.heading = data.name;
      newinst.instruction = data.instruction;
      mainArray.push(newinst);
      //Update Instruction
      const users = await INSTRUCTIONS.create({
        pickupInstructions: JSON.stringify(mainArray),
        companyId: req.companyId
      });
    }
    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/**
*@role Update Pickup Instruction
*/
app.post('/pickup/updateInstruction',adminAuth,async (req, res) => {
  try {
    const data = req.body;
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    var mainArray = [];
   
    var total = 0;
    var inst = JSON.parse(findData.dataValues.pickupInstructions);
    var total = inst.length;
    for (var i = 0; i < inst.length; i++) {
      var array         = {};
      var id            = i+1;
      if(data.istid == inst[i].id)
      {
        var heading       = data.nameedit;
        var instu         = data.editinstruction;
      }else{
        var heading       = inst[i].heading;
        var instu         = inst[i].instruction;
      }
      array.id          = id;
      array.heading     = heading;
      array.instruction = instu;
      mainArray.push(array);
    }
    
    //Update Instruction
    const users = await INSTRUCTIONS.update({
      pickupInstructions: JSON.stringify(mainArray)
    },
    {
      where: {
        companyId: req.companyId
      }
    });

    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, appstrings.oops_something, e.message);
  }

})

/////////////////////////////////////////////////////////
////////// Tip Instruction ////////////////////////
////////////////////////////////////////////////////////

app.get('/tip',adminAuth, async (req, res, next) => {
  try {

    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    if(findData){
      if(findData.dataValues.tips != ""){
         var inst = JSON.parse(findData.dataValues.tips);
      }else{
        var inst = [];
      }
     
    }else{
      var inst = [];
    }
    return res.render('admin/ordersetting/tip.ejs',{inst});
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});

/**
*@role Add Tip
*/
app.post('/addtip',adminAuth, async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    const findData = await INSTRUCTIONS.findOne({
      where: {
        companyId: req.companyId,
      }
    });
    if(findData){
      var inst = data.tip;
      if(typeof inst=='string')
      inst=[data.tip]


      var mainArray = [];
      for (var i = 0; i < inst.length; i++) {
        var array         = {};
        if(inst[i] != ""){
          var heading       = parseInt(inst[i]);
          mainArray.push(heading);
        }
      }
      //Update Instruction
      const users = await INSTRUCTIONS.update({
        tips: JSON.stringify(mainArray)
      },
      {
        where: {
          companyId: req.companyId
        }
      });
    }
    return responseHelper.post(res, appstrings.success, null,200);
  } catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
});
module.exports = app;

