const express          = require('express');
const router           = express.Router();

const authController   = require('../controllers/super/superauth.controller');
const empCtrl          = require('../controllers/super/superemployees.controller');
const companyCtrl      = require('../controllers/super/supercompany.controller');
const osettingCtrl     = require('../controllers/super/superinstruction.controller');
const profileCtrl      = require('../controllers/super/superprofile.controller');
const userCtrl         = require('../controllers/super/superusers.controller');
const settingCtrl      = require('../controllers/super/superdocument.controller');
const subscriptionController  = require('../controllers/super/supersubscription.controller');
router.use('/employees/',empCtrl);
router.use('/',authController);

router.use('/company',companyCtrl);
router.use('/ordersetting/',osettingCtrl)
router.use('/profile/',profileCtrl);
router.use('/users/',userCtrl);
router.use('/settings/',settingCtrl);
router.use('/subscription/',subscriptionController);
router.use((req, res, next) => {

   return responseHelper.error(res, 'Please again check the url,this path is not specified', 404);
});

module.exports = router;