var express = require('express');
var http = require('http');
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

var query = {
    "queryType": "SQL",
    "query": "select * from mongo.safe.CSV_20160122"
}

/* Perfect example of what I need to do! */
/* Or could look into: https://www.npmjs.com/package/request */
function queryDrill(callback) {

    return http.get({
        host: 'localhost:80801',
        path: '/query.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback({
                parsed
            });
        });
    });

}

var httpPost = function() {
    var options = {
        host: "localhost",
        port: 8081,
        path: '/query.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            return JSON.stringify({"Success": chunk});
        });
    });
    req.write(JSON.stringify(query));
    
    req.on('error', (e) => {
        return JSON.stringify({"Error: " : e.message});
    });
    
    req.end();
    
}



/* GET /documents/test */
/* Test route for using drill REST API to query data */
router.get('/test', function(req, res, next) {
    queryDrill(res.json());
});

