const { Strategy, ExtractJwt } = require('passport-jwt')
const keys = require('../keys')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.JWT
}

module.exports = new Strategy(options, (payload, done) => {
  if (Date.now() > payload.expires) {
    return done('jwt expired')
  }
  if (payload.type !== 'admin') {
    return done('jwt not admin')
  }

  return done(null, payload)
})
