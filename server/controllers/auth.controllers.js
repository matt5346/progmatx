const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const keys = require('../keys')
const User = require('../models/user.model')
const { findUserByField } = require('../helpers/findUser')
const mailTemplate = require('../email-templates/main-pattern')
const mailer = require('./mail.controllers')

module.exports.login = async (req, res) => {
  const candidate = await findUserByField('email', req.body.email)

  if (candidate) {
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, candidate.password)

    if (isPasswordCorrect) {
      const token = jwt.sign({
        email: candidate.email,
        userId: candidate.id,
        type: candidate.type
      }, keys.JWT, { expiresIn: 60 * 60 * 24 })

      res.cookie('jwt', jwt, { httpOnly: true, secure: true })
      res.json({
        ...candidate,
        token
      })
    } else {
      res.status(404).json({
        message: 'Неверный логин или пароль',
        code: 'user_not_found',
        validate: true
      })
    }
  } else {
    res.status(404).json({
      message: 'Неверный логин или пароль',
      code: 'user_not_found',
      validate: true
    })
  }
}

module.exports.createUser = async (req, res) => {
  const candidate = await findUserByField('email', req.body.email, ['id'])

  if (candidate) {
    res.status(409).json({
      message: 'Пользователь с такой почтой уже зарегистрирован',
      code: 'email_busy',
      validate: true
    })
  } else {
    if (req.body.password && req.body.password.length < 5) {
      res.status(409).json({
        message: 'Пароль должен состоять из символом больше 4 знаков',
        code: 'password_small',
        validate: true
      })
    }

    const salt = bcrypt.genSaltSync(10)
    const userData = {
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    }

    try {
      const user = await User.create(userData)
      const token = jwt.sign({
        email: req.body.email,
        userId: user.id
      }, keys.JWT, { expiresIn: 60 * 60 * 24 })
      const text = `Для подтверждения почты перейдите по ссылке:<br><a href='http://localhost:3000/api/confirm/email/${token}'>Подтвердить</a>`
      const userName = req.body.email.split('@')[0]
      const title = 'Подтверждение почты'

      try {
        await mailer.sendEmail('aren.aren.977@gmail.com', 'aren.aren.97@mail.ru', 'Подтверждение почты', mailTemplate(title, text, userName))
      } catch (e) {
        console.error('Mail send error', e)
        res.status(500).json({
          message: 'Mail send error'
        })
      }

      res.status(201).json({
        ...userData,
        token
      })
    } catch (e) {
      console.error('Sql create user error', e)
      res.status(500).json({
        message: 'Sql create user error'
      })
    }
  }
}

module.exports.resetPassword = async (req, res) => {
  const candidate = await findUserByField('email', req.body.email, ['id', 'email', 'name'])

  if (candidate) {
    const token = jwt.sign({
      email: candidate.email,
      userId: candidate.id
    }, keys.JWT, { expiresIn: 60 * 60 })
    const text = `Для сброса пароля перейдите по ссылке:<br><a href='http://localhost:3000/api/confirm/password/${token}'>Сбросить</a>`
    const userName = candidate.name || req.body.email.split('@')[0]
    const title = 'Сброс пароля'

    try {
      await mailer.sendEmail('aren.aren.977@gmail.com', 'aren.aren.97@mail.ru', 'Сброс пароля', mailTemplate(title, text, userName))
    } catch (e) {
      console.error('Mail send error', e)
      res.status(500).json({
        message: 'Mail send error'
      })
    }

    res.json({
      message: 'Ссылка на сброс пароля отправлена на вашу почту'
    })
  } else {
    res.status(404).json({
      message: 'Пользовтель не найден',
      code: 'user_not_found',
      validate: true
    })
  }
}

module.exports.changePassword = async (req, res) => {
  let candidate

  try {
    const { token, password } = req.body
    const user = jwt.verify(token, keys.JWT)
    const salt = bcrypt.genSaltSync(10)

    if (user && user.userId) {
      candidate = await User.update({ password: bcrypt.hashSync(password, salt) }, { where: { id: user.userId } })

      if (candidate && candidate.length) {
        res.json({ id: user.userId })
      } else {
        console.error('changePassword: Sql change password error')

        res.status(500).json({
          message: 'changePassword: Sql change password error'
        })
      }
    } else {
      res.status(404).json({
        message: 'Пользовтель не найден',
        code: 'user_not_found',
        validate: true
      })
    }
  } catch (e) {
    console.error('changePassword: Sql change password error', e)

    res.status(500).json({
      message: 'changePassword: Sql change password error'
    })
  }
}

module.exports.changePasswordIsAuth = async (req, res) => {
  const user = req.user
  const candidate = await findUserByField('id', user.userId, ['password'])
  const { password, newPassword } = req.body
  const isPasswordCorrect = bcrypt.compareSync(password, candidate.password)

  if (isPasswordCorrect) {
    try {
      const salt = bcrypt.genSaltSync(10)

      if (user && user.userId) {
        const passwordChanged = await User.update({ password: bcrypt.hashSync(newPassword, salt) }, { where: { id: user.userId } })

        if (passwordChanged && passwordChanged.length) {
          res.json({ id: user.userId })
        } else {
          console.error('changePassword: Sql change password error')

          res.status(500).json({
            message: 'changePassword: Sql change password error'
          })
        }
      } else {
        res.status(404).json({
          message: 'Пользовтель не найден',
          code: 'user_not_found',
          validate: true
        })
      }
    } catch (e) {
      console.error('changePassword: Sql change password error', e)

      res.status(500).json({
        message: 'changePassword: Sql change password error'
      })
    }
  } else {
    res.status(404).json({
      message: 'Неверный пароль',
      code: 'password_incorrect',
      validate: true
    })
  }
}

module.exports.changeEmail = async (req, res) => {
  const candidate = await findUserByField('email', req.body.email, ['id'])

  if (candidate && candidate.id) {
    res.status(409).json({
      message: 'Пользователь с такой почтой уже зарегистрирован',
      code: 'email_busy',
      validate: true
    })
  } else {
    try {
      const data = { email: req.body.email }
      const { userId } = req.user

      if (userId) {
        const emailChanged = await User.update(data, { where: { id: userId } })
        if (emailChanged && emailChanged.length) {
          res.json({ id: userId })
        }
      } else {
        res.status(404).json({
          message: 'Пользовтель не найден',
          code: 'user_not_found'
        })
      }
    } catch (e) {
      console.error('updateUser: Sql update user error', e)

      res.status(500).json({
        message: 'updateUser: Sql update user error'
      })
    }
  }
}

module.exports.changePrivateSettings = async (req, res) => {
  try {
    const { userId } = req.user

    if (userId) {
      const privateChanged = await User.update(req.body, { where: { id: userId } })
      if (privateChanged && privateChanged.length) {
        res.json({ id: userId })
      }
    } else {
      res.status(404).json({
        message: 'Пользовтель не найден',
        code: 'user_not_found'
      })
    }
  } catch (e) {
    console.error('updateUserPrivacy: Sql update user error', e)

    res.status(500).json({
      message: 'updateUserPrivacy: Sql update user error'
    })
  }
}

module.exports.updateUser = async (req, res) => {
  try {
    const data = {
      nick_name: req.body.nick_name,
      name: req.body.name,
      sname: req.body.sname,
      gender: req.body.gender,
      birth_date: req.body.birth_date,
      avatar: `/${req.file.filename}`
    }
    const user = req.user

    if (user && user.userId) {
      const candidate = await User.update(data, { where: { id: user.userId } })
      if (candidate && candidate.length) {
        res.json({ id: user.userId })
      }
    } else {
      res.status(404).json({
        message: 'Пользовтель не найден',
        code: 'user_not_found'
      })
    }
  } catch (e) {
    console.error('updateUser: Sql update user error', e)

    res.status(500).json({
      message: 'updateUser: Sql update user error'
    })
  }
}

module.exports.getUser = async (req, res) => {
  let candidate
  const { userId } = req.user

  try {
    candidate = await User.findOne({
      where: {
        id: userId
      },
      raw: true,
      nest: true
    })
  } catch (e) {
    res.status(404).json({
      message: 'Sql find user error'
    })
    console.error('Sql find user error', e)
  }

  if (candidate) {
    res.json(candidate)
  } else {
    res.status(404).json({
      message: 'Пользовтель не найден',
      code: 'user_not_found',
      validate: true
    })
  }
}
