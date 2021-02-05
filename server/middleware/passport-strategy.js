const { Strategy, ExtractJwt } = require('passport-jwt')
const keys = require('../keys')
const User = require('../models/user.model')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.JWT
}

module.exports = new Strategy(options, async (payload, done) => {
  console.log('payload payload payload', payload)
  try {
    const candidate = await User.findOne({
      where: {
        email: payload.email,
        id: payload.userId
      },
      raw: true,
      nest: true,
      attributes: ['id']
    })

    if (candidate) {
      done(null, candidate)
    } else {
      done(null, false, { message: 'Вы не авторизованы' })
    }
  } catch (e) {
    console.error('passport-strategy error', e)
    done(null, false, { message: 'Вы не авторизованы' })
  }
})
