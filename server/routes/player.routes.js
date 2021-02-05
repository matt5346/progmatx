const { Router } = require('express')
const passport = require('passport')
const { sendMessage, getMessages, getDialogs } = require('../controllers/player.controllers')
const router = Router()

router.post(
  '/send-message',
  passport.authenticate('jwt2', { session: false }),
  sendMessage
)

router.post(
  '/messages',
  passport.authenticate('jwt2', { session: false }),
  getMessages
)

router.get(
  '/dialogs',
  passport.authenticate('jwt2', { session: false }),
  getDialogs
)

module.exports = router
