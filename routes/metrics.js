const express = require('express')
const router = express.Router()

module.exports = router

/* POST /metrics */
router.post('/', function (req, res, next) {
  const result = req.body.events
    
  res.json(result)
})