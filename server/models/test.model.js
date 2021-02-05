const Sequelize = require('sequelize')
const db = require('../database/db')
const TestResult = require('./testResult.model')
const TestQuestion = require('./testQuestion.model')
// const TestsCategory = require('./testsCategory')

const Test = db.sequelize.define('test', {
  title: {
    type: Sequelize.STRING
  },
  code: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  published: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  onlyDirectLink: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: Sequelize.STRING
  },
  settings: {
    type: Sequelize.JSON
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

Test.hasMany(TestResult, { foreignKey: 'testId', as: 'results' })
Test.hasMany(TestQuestion, { foreignKey: 'testId', as: 'questions' })

module.exports = Test
