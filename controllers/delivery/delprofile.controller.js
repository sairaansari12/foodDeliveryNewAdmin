
const express = require('express');
const app = express();



app.get('/getProfile', checkAuth,async (req, res, next) => {



    try{
		const userData = await EMPLOYEE.findOne({
		where: {
      id    : req.id,
      companyId: req.myCompanyId

		}
	  })  
      
    if(userData)
    return responseHelper.post(res, 'Profile Detail',userData);
    
    else
      return responseHelper.post(res, appstrings.no_record, data, 204);
  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }
      

});



app.post('/updateProfile',checkAuth,async (req, res, next) => {
  const params = req.body;
console.log(params)
  try{
 let responseNull=  commonMethods.checkParameterMissing([params.firstName,params.email])
 if(responseNull) return responseHelper.post(res, appstrings.required_field,null,400);

var imageName="",idProof="",coverImage=""


  if (req.files) {
    ImageFile = req.files.profileImage;    
    if(ImageFile)
    {
    imageName = Date.now() + '_' + ImageFile.name.replace(/\s/g, "");
    ImageFile.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ imageName, function (err) {
        //upload file
        if (err)
        responseHelper.error(res,err.message,400)
       // return res.json(jsonResponses.response(0, err.message, null));
    });
  }
    ImageFile1 = req.files.idProof;    
    if(ImageFile1)
    {
      idProof = Date.now() + '_' + ImageFile1.name.replace(/\s/g, "");
    ImageFile1.mv(config.UPLOAD_DIRECTORY +"employees/proofs/"+ idProof, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }
    
      
  ImageFile2 = req.files.coverImage;    
    if(ImageFile2)
    {
      coverImage = Date.now() + '_' + ImageFile2.name.replace(/\s/g, "");
    ImageFile2.mv(config.UPLOAD_DIRECTORY +"employees/images/"+ coverImage, function (err) {
        //upload file
        if (err)
        {
          console.log(err)
        return responseHelper.error(res, err.message, 400);   
        }
      });
  }


    }

  


const userData = await EMPLOYEE.findOne({
  where: {
    id: req.id ,
    companyId: req.myCompanyId

  }
});


if(userData)
{

  if(imageName=="")  imageName= userData.dataValues.image
  if(idProof=="")  idProof= userData.dataValues.idProof
  if(coverImage=="")  coverImage= userData.dataValues.coverImage

  

const updatedResponse = await EMPLOYEE.update({
  firstName: params.firstName,
  lastName: params.lastName,
  address: params.address,
  image: imageName,
  email: params.email,
  idProof:idProof,
  coverImage:coverImage,
  idProofName:params.idProofName

},
{
  where : {
  id: userData.dataValues.id
}
});

if(updatedResponse)
      {
      const updatedResponseData = await EMPLOYEE.findOne({
        where: {
          id: userData.dataValues.id }
      });
     

      if(updatedResponseData)
    return responseHelper.post(res, 'Updated Successfully',updatedResponseData);
      }
      else{
        return responseHelper.post(res, 'Something went Wrong',400);
 
      }

}
  }
    catch (e) {
      return responseHelper.error(res, e.message, 400);
    }

 
})








module.exports = app;



//Edit User Profile
