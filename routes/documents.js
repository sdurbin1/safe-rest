var express = require('express');
var http = require('http');
var Promise = require('bluebird')
var router = express.Router();

module.exports = router;

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/safe';


var insertDocument = function(db, name, doc, callback) {
   db.collection(name).insert( 
        doc
   , function(err, result) {
    if(err == null) {
        console.log("Inserted a document");
    } else {
        console.log("Error inserting document: " + err);
    }
    callback();
  });
};

var connectAndInsertDoc = function(name, doc) {
    MongoClient.connect(url, function(err, db) {
        if(err != "null"){
            insertDocument(db, name, doc, function() {
                db.close();
            });
        } else {
            console.log("Error connecting to mongo: " + err);
        }
    });
};


/* POST /documents */
router.post('/', function(req, res, next) {
    var name = req.body.name;
    var doc = req.body.document;
    
    connectAndInsertDoc(name, doc);
    
    res.json({"name":name, "Document":doc});
});


function queryDrill(options, query) {
    return new Promise(function (fullfill, reject) {
        var ret = ''
        
        var req = http.request(options, function (response) {
            response.setEncoding('utf8')
            response.on('data', function(chunk) {
                ret += chunk 
            })
            response.on('end', function() {
                fullfill(JSON.parse(ret))
            })
        })
        req.write(JSON.stringify(query))
        
        req.on('error', function(error) {
            reject(error)
        })
        
        req.end()
    })
}


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
    
    var query = {
        "queryType": "SQL",
        "query": "select * from mongo.safe.CSV_20160122"
    }
    
    queryDrill(options, query)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })
});

