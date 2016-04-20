var express = require('express');
var http = require('http');
var Promise = require('bluebird')
var router = express.Router();
var mongoUtil = require('../utils/mongoUtil');

module.exports = router;


/* POST /documents */
router.post('/', function(req, res, next) {
    var name = req.body.name;
    var doc = req.body.document;
    
    mongoUtil.connectAndInsertDoc(name, doc);
    
    res.json({"name":name, "Document":doc});
});



/* GET /documents/test */
/* Test route for using drill REST API to query data */
router.get('/test', function(req, res, next) {
    
    var options = {
        host: "localhost",
        port: 8081,
        path: '/query.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    var filterString = "Age > 25"
    var filters = "where " + filterString
    var queryString = "select * from mongo.safe.CSV_20160122 " + filters
    
    /*queryDrill(options, queryString)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })*/
});

