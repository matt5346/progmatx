const User = require('../models/user.model')

module.exports.findUserByField = async (fieldName, fieldValue, attributes = ['*']) => {
  let candidate
  const where = {}
  where[fieldName] = fieldValue

  try {
    candidate = await User.findOne({
      where,
      attributes,
      raw: true,
      nest: true
    })
  } catch (e) {
    console.error('Sql find user error', e)
  }

  return candidate
}
