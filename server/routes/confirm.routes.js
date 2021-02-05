const { Router } = require('express')
const { confirmEmail, resetPassword } = require('../controllers/confirm.controllers')
const router = Router()

router.get(
  '/email/:token',
  // passport.authenticate('jwt', { session: false, failureRedirect: '/?message=emailNotConfirmed' }),
  confirmEmail
)

router.get('/password/:token', resetPassword)

module.exports = router
