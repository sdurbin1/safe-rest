const authentication = require('../utils/authentication')
const express = require('express')
const router = express.Router()

module.exports = router

/* GET /authenticate */
router.get('/', function (req, res, next) {
  authentication.authenticate(req, res)
    .then((user) => res.send(user))
    .catch(error => res.status(503).send(error))
})
