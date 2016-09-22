const Promise = require('bluebird')

const operatorMap = {
  '=': '$eq',
  '<': '$lt',
  '>': '$gt',
  '<=': '$lte',
  '>=': '$gte',
  '!=': '$ne'
}

exports.queryMongo = (db, collection, query, limit) => {
  return new Promise(function (resolve, reject) {
    const cursor = db.collection(collection).find(query).limit(limit)
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

exports.labeledQueryMongo = (db, collection, query, type, name, limit) => {
  return new Promise(function (resolve, reject) {
    const cursor = db.collection(collection).find(query).limit(limit)
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

exports.buildQueryJson = (filters) => {
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

exports.buildFilterJson = (value) => {
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

exports.insertDocument = (db, name, doc) => {
  return new Promise(function (resolve, reject) {
    db.collection(name).insert(doc, function (err, result) {
      if (err != null) { reject(err) }
    
      resolve({'success': true})
    })
  })
}

exports.deleteDocument = (db, name) => {
  return new Promise(function (resolve, reject) {
    db.collection(name).drop(function (err, numberRemoved) {
      if (err != null) { reject(err) }
            
      resolve({'success': true})
    })
  })
}

exports.documentExists = (db, collectionName) => {
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

exports.populateRouterParam = (collection, id, req, next, paramName) => {
  collection
    .findById(id)
    .then(paramValue => {
      if (!paramValue) { return next(new Error('can\'t find ' + paramName)) }

      req[paramName] = paramValue
      
      return next()
    })
    .catch(err => next(err))
}

const returnResults = exports.returnResults = (result, res, next) => {
  return result
    .then(results => { res.json(results) })
    .catch(err => {
      console.log(err)
      
      return next(err)
    })
}

exports.getAllModelObject = (model, res, next) => {
  return returnResults(model.find(), res, next)
}

exports.saveModelObject = (Model, res, req, next) => {
  const modelInstance = new Model(req.body)

  return returnResults(modelInstance.save(), res, next)
}

exports.removeModelObject = (model, id, res, next) => {
  return model
    .find({'_id': id})
    .remove()
    .then(results => { res.json({}) })
    .catch(err => next(err))
}

exports.populateQueryResults = (query, res, next, path) => {
  returnResults(
    query.then !== undefined
    ? query.then(results => results.populate(path).execPopulate())
    : query.populate(path).execPopulate(),
    res,
    next
  )
}

exports.populateAndReturnResults = (object, params, res, next) => (
  returnResults(populate(object, params), res, next)
)

const populate = exports.populate = (object, params) => {
  const populated = object.populate
    ? object.populate(params)
    : object.then(populated => execPopulate(populated.populate(params)))
  
  return execPopulate(populated)
}

const execPopulate = exports.execPopulate = populated => (
    populated.execPopulate ? populated.execPopulate() : populated
)
