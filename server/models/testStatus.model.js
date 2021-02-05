const Sequelize = require('sequelize')
const db = require('../database/db')
const Test = require('./test.model')
const User = require('./user.model')

const TestStatus = db.sequelize.define('testStatus', {
  ID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING
  },
  currentPage: {
    type: Sequelize.NUMBER
  },
  overallScore: {
    type: Sequelize.NUMBER
  },
  link: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

User.belongsToMany(Test, {
  through: TestStatus,
  as: 'tests',
  foreignKey: 'userId'
})
Test.belongsToMany(User, {
  through: TestStatus,
  as: 'users',
  foreignKey: 'testId'
})

TestStatus.belongsTo(User, {
  foreignKey: 'userId', as: 'users'
})
TestStatus.belongsTo(Test, {
  foreignKey: 'testId', as: 'tests'
})

User.hasMany(TestStatus, {
  foreignKey: 'userId',
  as: 'statuses'
})
Test.hasMany(TestStatus, {
  foreignKey: 'testId',
  as: 'statuses'
})

module.exports = TestStatus
