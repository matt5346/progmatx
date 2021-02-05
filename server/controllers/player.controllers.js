// const jwt = require('jsonwebtoken')
// const keys = require('../keys')
const { Op } = require('sequelize')
const Message = require('../models/message.model')

module.exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body)
    res.json(message)
  } catch (e) {
    res.status(404).json({ message: 'SQL message create Error' })
  }
}

module.exports.getMessages = async (req, res) => {
  const { dialogId } = req.body

  try {
    const messages = await Message.findAll({
      where: { dialogId }
    })

    res.json(messages)
  } catch (e) {
    res.status(404).json({ message: 'SQL get Messages Error' })
  }
}

module.exports.getDialogs = async (req, res) => {
  const { userId } = req.user

  try {
    const dialogs = await Message.findAll({
      where: {
        [Op.or]: [{ userId }, { toId: userId }]
      },
      attributes: ['id', 'dialogId'],
      group: 'dialogId'
    })

    res.json(dialogs)
  } catch (e) {
    res.status(404).json({ message: 'SQL get Dialogs Error' })
  }
}
