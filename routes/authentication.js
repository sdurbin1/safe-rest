var express = require('express')
var router = express.Router()

module.exports = router

/* GET /authenticate */
router.get('/', function(req, res, next) {
    var result = { username: "user", authenticated: true }
    
    res.json(result)
})
