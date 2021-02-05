const Sequelize = require('sequelize')
const db = require('../database/db')

const TestResult = db.sequelize.define('testResult', {
  title: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  scoreMin: {
    type: Sequelize.STRING
  },
  scoreMax: {
    type: Sequelize.STRING
  },
  testId: {
    type: Sequelize.NUMBER
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

module.exports = TestResult
