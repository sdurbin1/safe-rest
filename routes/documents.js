var express = require('express');
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

