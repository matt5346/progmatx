const { Router } = require('express')
const { getAll } = require('../controllers/user.controllers')
const router = Router()

router.get('/', getAll)

module.exports = router
