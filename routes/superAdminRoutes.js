const express                     = require('express');
const router                      = express.Router();

const authController              = require('../controllers/super/superauth.controller');
const empCtrl              = require('../controllers/super/superemployees.controller');




router.use('/employees/',empCtrl);
router.use('/',authController);





router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;