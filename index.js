const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const db = require('./db/db');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socket = require('./socket')(io);
const expressValidator = require('express-validator');
config = require('config');
var cookieParser  = require('cookie-parser');
var flash         = require('connect-flash');
 tc = require("time-slots-generator");

var middleware         = require("./middleware/auth");

checkAuth         = middleware.userAuth
adminAuth         = middleware.adminAuth
superAuth         = middleware.superAuth
restAuth           = middleware.restAuth
 sequelize = require('sequelize')

const routes = require('./routes/routes');
const checkConn = require('./helpers/checkConn');
const fileUpload = require('express-fileupload');
commonMethods=require('./controllers/api/common/common')
appstrings=require('./language/strings.json')['en']
const cors = require('cors');
const session     = require('express-session');
adminpath="/api/company/"
adminfilepath="admin/dashboard/"

superadminpath="/api/admin/"
superadminfilepath="super/dashboard/"

CURRENCY="Rs."
responseHelper = require("./helpers/responseHelper");
common = require('./helpers/common');

const port = config.PORT || 9066;


app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(session(
  { secret: 'mysecret',
    resave: true,
    saveUninitialized: true}));

app.use((req, res, next) => {
  if (req.session) {
    res.locals.successMessage = req.flash("successMessage");
    res.locals.errorMessage = req.flash("errorMessage");
    res.locals.messages = req.session.messages;
    res.locals.userInfo = req.session.userInfo;
    res.locals.userData = req.session.userData;
    res.locals.userId = req.session.userId;
    req.session.messages = {};
  }
  next();
});


app.use(expressValidator());
app.use(cors());
/*
Increase Upload File Size
*/
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(fileUpload({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));

app.use('/api', routes);
/*
Serve Static Folder
*/
app.use('/', express.static(path.join(__dirname, '/public')));
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



/*
Check Db connection
*/
const healthCheck = async () => {
  await checkConn.checkDbConnection();
};

/*
Start Server
*/
server.listen(port, async () => {
  await healthCheck();

  console.log(`Listening on port ${port}`);
});
