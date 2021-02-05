const Sequelize = require('sequelize')
const db = require('../database/db')
const Test = require('./test.model')
const TestsCategory = require('./testsCategory.model')

const TestsCategoryTest = db.sequelize.define('testsCategoryTest', {
  ID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

TestsCategory.belongsToMany(Test, {
  through: TestsCategoryTest,
  as: 'tests',
  foreignKey: 'testCategoryId'
})
Test.belongsToMany(TestsCategory, {
  through: TestsCategoryTest,
  as: 'categories',
  foreignKey: 'testId'
})

TestsCategoryTest.belongsTo(TestsCategory, {
  foreignKey: 'testCategoryId', as: 'categories'
})
TestsCategoryTest.belongsTo(Test, {
  foreignKey: 'testId', as: 'tests'
})

TestsCategory.hasMany(TestsCategoryTest, {
  foreignKey: 'testCategoryId',
  as: 'TestsCategoryTest'
})
Test.hasMany(TestsCategoryTest, {
  foreignKey: 'testId',
  as: 'TestsCategoryTest'
})

module.exports = TestsCategoryTest
