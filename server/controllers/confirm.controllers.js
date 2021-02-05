const jwt = require('jsonwebtoken')
const keys = require('../keys')
const User = require('../models/user.model')

module.exports.confirmEmail = async (req, res) => {
  try {
    const user = jwt.verify(req.params.token, keys.JWT)

    if (user && user.userId) {
      await User.update({ confirmed: true }, { where: { id: user.userId } })
    } else {
      res.status(404).json({
        message: 'Пользовтель не найден',
        code: 'user_not_fount'
      })
    }
  } catch (e) {
    res.status(401).json({ message: 'SQL update error or not token param' })
  }

  return res.redirect('/?message=emailConfirmed')
}

module.exports.resetPassword = (req, res) => {
  try {
    const user = jwt.verify(req.params.token, keys.JWT)

    if (user && user.userId) {
      return res.redirect(`/?message=ResetPassword&token=${req.params.token}`)
    } else {
      res.status(404).json({
        message: 'Пользовтель не найден',
        code: 'user_not_fount'
      })
    }
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.redirect('/?message=TokenExpiredError')
    }
    if (e.name === 'JsonWebTokenError') {
      return res.redirect('/?message=JsonWebTokenError')
    }
    res.status(401).json({ message: 'SQL update error or not token param' })
  }
}
