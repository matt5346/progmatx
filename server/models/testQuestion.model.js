const Sequelize = require('sequelize')
const db = require('../database/db')
const TestQuestionAnswer = require('./TestQuestionAnswer.model')

const TestQuestion = db.sequelize.define('testQuestion', {
  title: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  testId: {
    type: Sequelize.NUMBER
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})
TestQuestion.hasMany(TestQuestionAnswer, { foreignKey: 'questionId', as: 'answers' })

module.exports = TestQuestion
