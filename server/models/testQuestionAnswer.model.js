const Sequelize = require('sequelize')
const db = require('../database/db')

const TestQuestionAnswer = db.sequelize.define('testQuestionAnswer', {
  title: {
    type: Sequelize.STRING
  },
  score: {
    type: Sequelize.STRING
  },
  testId: {
    type: Sequelize.NUMBER
  },
  questionId: {
    type: Sequelize.NUMBER
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

module.exports = TestQuestionAnswer
