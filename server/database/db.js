const Sequelize = require('sequelize')
const keys = require('../keys')
const db = {}
const sequelize = new Sequelize(keys.DB_NAME, keys.DB_USER, keys.DB_PASS, {
  host: keys.DB_HOST,
  dialect: 'mysql',
  operatorsAliases: '0',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
