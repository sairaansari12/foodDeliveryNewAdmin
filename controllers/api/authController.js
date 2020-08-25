
const express = require('express');

const app = express();
const bcrypt = require('bcryptjs');
const v = require('node-input-validator');
const hashPassword = require('../../helpers/hashPassword');

const jwt = require('jsonwebtoken');
const util = require('util');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: `../env-files/${process.env.NODE_ENV || 'development'}.env`,
});


USER=db.models.users
// Generate Hash
const createHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};


// app.post('/login',async (req, res, next) => {
//   const params = req.body;


//   let responseNull=  commonMethods.checkParameterMissing([params.phoneNumber,params.countryCode,params.companyId])
//   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
//   try{
// 		const userData = await USER.findOne({
// 		where: {
//       phoneNumber: params.phoneNumber,
//       countryCode: params.countryCode,

// 		}
// 	  })  
      
//     if(userData)
//    {
   

//     const match = await hashPassword.comparePass(params.password,userparams.password);

//     // compare pwd
//     if (!match) {
//       return responseHelper.unauthorized(res, 'Invalid Password');
//     }


//       let token = jwt.sign(
//         {
//           phoneNumber: params.phoneNumber,
//           companyId:    userData.dataValues.companyId,
//           countryCode: params.countryCode,
//           type: 1,
//           id : userData.dataValues.id

//         },
//         config.JWT_KEY,
//         { expiresIn: '2880m' }
//       );



//       const updatedResponse = await USER.update({
//         sessionToken: token,
//         platform: params.platform,
//         deviceToken: params.deviceToken,
//       },
//       {
//         where : {
//         id: userData.dataValues.id
//       }
//       });
     
    
    
//       if(updatedResponse)
//       {


// userData.dataValues.sessionToken=token
// userData.dataValues.platform=params.platform
// userData.dataValues.deviceToken=params.deviceToken


//     return responseHelper.post(res, 'Login Successfully',userData);
//       }
//       }
     

//     return responseHelper.error(res, 'Incorrect Username or Password');
  
// }
// catch (e) {
//   return responseHelper.error(res, e.message, 400);
// }
  
// })



// app.post('/login',async (req, res, next) => {
//   const params = req.body;


//   let responseNull= commonMethods.checkParameterMissing([params.phoneNumber,params.countryCode,params.companyId])
//   if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

  
//   try{
// 		const userData = await USER.findOne({
// 		where: {
//       phoneNumber: params.phoneNumber,
//       countryCode: params.countryCode,
//       companyId: params.companyId

// 		}
// 	  })  
      
//     if(userData)
//    {
//     return responseHelper.post(res, 'User Exists',userData);
//       }
      
     
//     return responseHelper.post(res, 'User Does not Exists',null,400);
  
// }
// catch (e) {
//   return responseHelper.error(res, e.message, 400);
// }
  
// })


app.post('/logout',checkAuth,async (req, res, next) => {
  const params = req.body;
try{

  const updatedResponse = await USER.update({
    sessionToken: "",
    deviceToken: "",
  },
  {
    where : {
    id:req.id,
    companyId: req.myCompanyId
  }
  });



  if(updatedResponse)
  {
    return responseHelper.post(res, 'Logout Successfully');
  }
    
else
return responseHelper.post(res, 'Logout Successfully');


}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  

  
 
})



app.post('/signup',async (req, res) => {
  try {
    const data = req.body;


    let responseNull= commonMethods.checkParameterMissing([data.phoneNumber,data.countryCode,data.companyId,data.firstName,data.email,data.password])
    if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);


    const user = await USER.findOne({
      attributes: ['phoneNumber'],
      where: {
        phoneNumber: data.phoneNumber,
        companyId: data.companyId

      }
    });



    if (!user) {
      const pswd = await hashPassword.generatePass(data.password);
      data.password = pswd;

  

      const users = await USER.create({
        firstName: data.firstName,
        email: data.email,
        address: data.address,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        password: pswd,
        deviceToken: data.deviceToken,
        platform: data.platform,
        companyId: data.companyId
       });


      if (users) {
        const userId = users.dataValues.id;
        data.userId = userId;
        const credentials = {
          phoneNumber: users.dataValues.phoneNumber,
          companyId:   users.dataValues.companyId,
          countryCode: users.dataValues.countryCode,
          userType: 1,
          id : userId
        };



        const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });
        const refreshToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.refreshTokenExpiration });
        const userDetail = {};
        userDetail.email = users.dataValues.email;
        userDetail.firstName = users.dataValues.firstName;
        userDetail.lastName = users.dataValues.lastName;
        userDetail.image = '';
        // userDetail.deviceToken = users.dataValues.deviceToken;
        userDetail.sessionTken = authToken;
        userDetail.refreshToken = refreshToken;
        userDetail.id = userId;
   

    const updateDevicetoken = await USER.update({
        sessionToken: authToken,
        platform: data.deviceToken,
        deviceToken: data.deviceToken,
    },
        {
          where: {
            id: users.dataValues.id
          }
        });
        return responseHelper.post(res, appstring.success, userDetail);
      }

    } else {
      responseHelper.error(res, appstrings.already_exists, 409);
    }

  } catch (e) {
    return responseHelper.error(res,  appstrings.oops_something, e.message);
  }

})



app.post('/login',async (req, res, next) => {
  const params = req.body;


  let responseNull=  commonMethods.checkParameterMissing([params.phoneNumber,params.countryCode,params.companyId])
  if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);
  
  try{
		const userData = await USER.findOne({
		where: {
      phoneNumber: params.phoneNumber,
      countryCode: params.countryCode,

		}
	  })  
      
    if(userData)
   {
   

      let token = jwt.sign(
        {
          phoneNumber: params.phoneNumber,
          myCompanyId:    userData.dataValues.companyId,
          countryCode: params.countryCode,
          userType: 1,
          parentCompany: userData.dataValues.companyId,
          id : userData.dataValues.id

        },
        config.jwtToken,
        { algorithm: 'HS256', expiresIn: '2880m' }
      );



      const updatedResponse = await USER.update({
        sessionToken: token,
        platform: params.platform,
        deviceToken: params.deviceToken,
      },
      {
        where : {
        id: userData.dataValues.id
      }
      });
     
    
    
      if(updatedResponse)
      {


userData.dataValues.sessionToken=token
userData.dataValues.platform=params.platform
userData.dataValues.deviceToken=params.deviceToken
var btype=await commonMethods.getBusinessType(params.companyId)
if(btype && btype.dataValues && btype.dataValues.type) userData.dataValues.btype=btype.dataValues.type
else userData.dataValues.btype=0

    return responseHelper.post(res, 'Login Successfully',userData);
      }
      }

      else{


        const users = await USER.create({
          firstName: params.firstName,
          email: params.email,
          address: params.address,
          phoneNumber: params.phoneNumber,
          countryCode: params.countryCode,
          deviceToken: params.deviceToken,
          platform: params.platform,
          companyId: params.companyId
         });
  
  
        if (users) {
          const userId = users.dataValues.id;
          params.userId = userId;

        
          const credentials = {
            phoneNumber: users.dataValues.phoneNumber,
            myCompanyId:   users.dataValues.companyId,
            parentCompany:users.dataValues.companyId,
            countryCode: users.dataValues.countryCode,
            userType: 1,
            id : userId
          };
  
  
  
          const authToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.authTokenExpiration });
          const refreshToken = jwt.sign(credentials, config.jwtToken, { algorithm: 'HS256', expiresIn: config.refreshTokenExpiration });


  
  
      const updateDevicetoken = await USER.update({
          sessionToken: authToken,
          platform: params.deviceToken,
          deviceToken: params.deviceToken,
          refreshToken: refreshToken
      },
          {
            where: {
              id: users.dataValues.id
            }
          });

          const userData = await USER.findOne({
            where: {
              id:users.dataValues.id ,
        
            }
            })  
          
            var btype=await commonMethods.getBusinessType(params.companyId)
if(btype && btype.dataValues && btype.dataValues.type) userData.dataValues.btype=btype.dataValues.type
else userData.dataValues.btype=0
         if(userData) return responseHelper.post(res, 'User Detail', userData);
else return responseHelper.post(res, 'Something Error', null,400);

      }
      }

  
}
catch (e) {
  return responseHelper.error(res, e.message, 400);
}
  
})




module.exports = app;



//Edit User Profile
