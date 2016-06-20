const express = require('express')
const router = express.Router()

module.exports = router

/* GET /authenticate */
router.get('/', function (req, res, next) {
  const result = {username: 'user', authenticated: true, sid: 'sid'}
    
  res.json(result)
})
