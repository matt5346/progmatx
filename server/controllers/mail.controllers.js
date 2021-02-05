const nodemailer = require('nodemailer')
const keys = require('../keys')

const transport = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: keys.MAIL_USER,
    pass: keys.MAIL_PASS
  },
  port: 465,
  secure: true,
  tls: {
    rejectUnauthorized: true
  }
})

module.exports = {
  sendEmail (from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transport.sendMail({ from, subject, to, html }, (err, info) => {
        if (err) {
          reject(err)
        }

        resolve(info)
      })
    })
  }
}
