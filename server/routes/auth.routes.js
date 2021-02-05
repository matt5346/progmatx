const { Router } = require('express')
const passport = require('passport')
const upload = require('../middleware/upload')
const { login, createUser, getUser, resetPassword, changePassword, changePasswordIsAuth, updateUser, changeEmail, changePrivateSettings } = require('../controllers/auth.controllers')
const router = Router()

router.post('/login', login)
router.post('/create', createUser)
router.put(
  '/update',
  passport.authenticate('jwt2', { session: false }),
  upload.single('image'),
  updateUser
)
router.post('/reset-password', resetPassword)
router.put('/change-password', changePassword)
router.put(
  '/change-password-is-auth',
  passport.authenticate('jwt2', { session: false }),
  changePasswordIsAuth
)
router.put(
  '/change-email',
  passport.authenticate('jwt2', { session: false }),
  changeEmail
)
router.put(
  '/change-private',
  passport.authenticate('jwt2', { session: false }),
  changePrivateSettings
)
router.get(
  '/user',
  passport.authenticate('jwt2', { session: false }),
  getUser
)

module.exports = router
