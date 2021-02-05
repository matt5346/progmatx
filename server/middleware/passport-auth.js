// const passport = require('passport')
// const HTTPStatus = require('http-status')
//
// module.exports.authenticate = (strategy, options) => {
//   return function (req, res, next) {
//     passport.authenticate(strategy, options, (error, user , info) => {
//       if (error) {
//         return next(error)
//       }
//       if (!user) {
//         return next(new TranslatableError('unauthorised', HTTPStatus.UNAUTHORIZED));
//       }
//       if (options.session) {
//         return req.logIn(user, (err) => {
//           if (err) {
//             return next(err)
//           }
//           return next()
//         });
//       }
//       req.user = user
//       next()
//     })(req, res, next)
//   }
// }
