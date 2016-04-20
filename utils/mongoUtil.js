var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

exports.queryMongo = queryMongo;
exports.insertDocument = insertDocument;
exports.buildQueryJson = buildQueryJson;

var url = 'mongodb://localhost:27017/safe';

var operatorMap = {
    '=': '$eq',
    '<': '$lt',
    '>': '$gt',
    '<=': '$lte',
    '>=': '$gte',
    '!=': '$ne'
}

function queryMongo(db, collection, query) {
    return new Promise(function (fullfill, reject) {
        
        var cursor = db.collection(collection).find(query)
        var results = []
        cursor.each(function(err, doc) {
            if(err != null) { reject(err) }
            
            if (doc != null) {
                results.push(doc)
            } else {
                fullfill(results)
            }
        });

    });
};

function buildQueryJson(filters) {
    var queryJson = {}
    filters.forEach(function(value) {
        var field = value.field
        var operator = value.operator
        var value = value.value
        var mongoOperator = operatorMap[operator]
        var comparison = {}
        comparison[mongoOperator] = value
        queryJson[field] = comparison
    })
    return queryJson
}

function insertDocument(db, name, doc) {
    return new Promise(function (fullfill, reject) {
        db.collection(name).insert(doc, function(err, result) {
            if(err != null) { reject(err) }
            
            fullfill({"Success":true})
        });    
    });
}