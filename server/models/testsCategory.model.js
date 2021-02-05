const Sequelize = require('sequelize')
const db = require('../database/db')

const TestsCategory = db.sequelize.define('testsCategory', {
  title: {
    type: Sequelize.STRING
  },
  code: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  showInMenu: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  showInSelect: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  image: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

module.exports = TestsCategory
