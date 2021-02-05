const Sequelize = require('sequelize')
const db = require('../database/db')

const Message = db.sequelize.define('message', {
  text: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.NUMBER
  },
  toId: {
    type: Sequelize.NUMBER
  },
  dialogId: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
})

module.exports = Message
