const Sequelize = require('sequelize');
 config = require('config').db;
const models = require('./models');

// const firebase = require('firebase');
// const firebaseApp = firebase.initializeApp(config.firebase);

 db = new Sequelize(config.database, config.username, config.password,
   {
  host: config.host,
  dialect: config.dialect,
  pool: config.pool
  }
);

db.models = models;
//db.sync({force: true});

module.exports = db;