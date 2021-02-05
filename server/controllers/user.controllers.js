// const jwt = require('jsonwebtoken')
// const keys = require('../keys')
const User = require('../models/user.model')

module.exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (e) {
    res.status(401).json({ message: 'SQL get all Error' })
  }
}
