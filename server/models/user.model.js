const Sequelize = require('sequelize')
const db = require('../database/db')

const User = db.sequelize.define('user', {
  name: {
    type: Sequelize.STRING
  },
  sname: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    len: [4, 255],
    allowNull: false
  },
  birth_date: {
    type: Sequelize.STRING
  },
  nick_name: {
    type: Sequelize.STRING,
    unique: true,
    len: [0, 20]
  },
  gender: {
    type: Sequelize.STRING
  },
  avatar: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.STRING
  },
  confirmed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  showDoneTests: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  showInList: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  statusOnline: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

module.exports = User
