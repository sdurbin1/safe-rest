var express = require('express');
var router = express.Router();

module.exports = router;

/* GET /authentication/authenticate */
router.get('/authenticate', function(req, res, next) {
    var result = { username: "user", authenticated: true };
    
    res.json(result);
});