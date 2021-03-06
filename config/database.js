const Sequelize = require('sequelize');
secretpw = process.env.SECRET_PW
module.exports = new Sequelize('indieca', 'postgres', secretpw, {
  host: 'localhost',
  dialect:'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});