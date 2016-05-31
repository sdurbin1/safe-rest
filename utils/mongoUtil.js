const Promise = require('bluebird')

exports.queryMongo = queryMongo
exports.labeledQueryMongo = labeledQueryMongo
exports.insertDocument = insertDocument
exports.buildQueryJson = buildQueryJson
exports.buildFilterJson = buildFilterJson
exports.deleteDocument = deleteDocument
exports.documentExists = documentExists

const operatorMap = {
  '=': '$eq',
  '<': '$lt',
  '>': '$gt',
  '<=': '$lte',
  '>=': '$gte',
  '!=': '$ne'
}

function queryMongo (db, collection, query) {
  return new Promise(function (resolve, reject) {
    const cursor = db.collection(collection).find(query)
    const results = []

    cursor.each(function (err, doc) {
      if (err != null) { reject(err) }
            
      if (doc != null) {
        results.push(doc)
      } else {
        resolve(results)
      }
    })
  })
}

function labeledQueryMongo (db, collection, query, type, name) {
  return new Promise(function (resolve, reject) {
    const cursor = db.collection(collection).find(query)
    const results = []
    const final = {}

    cursor.each(function (err, doc) {
      if (err != null) { reject(err) }
            
      if (doc != null) {
        results.push(doc)
      } else {
        final['type'] = type
        final['name'] = name
        final['results'] = results
        resolve(final)
      }
    })
  })
}

function buildQueryJson (filters) {
  if (!filters) { return {} }
  const queryJson = {}
  
  filters.forEach(function (value) {
    const field = value.field
    const operator = value.operator
    const val = value.value
    const mongoOperator = operatorMap[operator]
    const comparison = {}
    
    comparison[mongoOperator] = val
    queryJson[field] = comparison
  })
  
  return queryJson
}

function buildFilterJson (value) {
  if (!value) { return {} }
  const queryJson = {}
  
  const field = value.field
  const operator = value.operator
  const val = value.value
  const mongoOperator = operatorMap[operator]
  const comparison = {}
    
  comparison[mongoOperator] = val
  queryJson[field] = comparison
  
  return queryJson
}

function insertDocument (db, name, doc) {
  return new Promise(function (resolve, reject) {
    db.collection(name).insert(doc, function (err, result) {
      if (err != null) { reject(err) }
    
      resolve({'success': true})
    })
  })
}

function deleteDocument (db, name) {
  return new Promise(function (resolve, reject) {
    db.collection(name).drop(function (err, numberRemoved) {
      if (err != null) { reject(err) }
            
      resolve({'success': true})
    })
  })
}

function documentExists (db, collectionName) {
  return new Promise(function (resolve, reject) {
    db.listCollections({name: collectionName})
    .next(function (err, collinfo) {
      if (err != null) { reject(err) }
      
      if (collinfo) {
        resolve({'hasData': true})
      } else {
        resolve({'hasData': false})
      }
    })
  })
}
