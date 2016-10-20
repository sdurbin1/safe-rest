'use strict'
const mongoUtil = require('../utils/mongoUtil')
const Promise = require('bluebird')
const transformUtil = require('../utils/transformUtil')
const config = require('../config')

const analyticMethods = {
  Average: average,
  Count: count,
  'Detailed Count': detailedCount
}

const visualizationMethods = {
  Summary: summaryCount
}

exports.mongoExecute = (requestBody, db, modelObject) => {
  const queryJson = mongoUtil.buildQueryJson(requestBody.filters)

  return mongoUtil
    .populate(modelObject, ['visualizationType', 'analytic', 'source'])
    .then(modelObject => {
      const {analytic = {}, visualizationType} = modelObject
      const {name: analyticName} = analytic
      const {name: typeName} = visualizationType
      const analyticMethod =
        analyticMethods[analyticName] ||
        visualizationMethods[typeName] ||
        search
      const limit = getExecuteQueryLimit(modelObject)
      
      return analyticMethod(queryJson, db, modelObject, limit)
    })
    .catch(err => { console.log(err); throw err })
}

exports.mongoQuery = (requestBody, db, source) => {
  const queryJson = mongoUtil.buildQueryJson(requestBody.filters)
  const sourceId = source._id.toString()
  const limit = getSearchQueryLimit()

  return mongoUtil.queryMongo(db, sourceId, queryJson, limit)
}

function count (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const {_id: src} = visualization.source
    const {analyticParams: params} = visualization
    const collection = db.collection('' + src)
    
    collection.aggregate([{$match: queryJson}, {$limit: limit}, {$group: {_id: params, count: {$sum: 1}}}],
      function (err, result) {
        if (err) {
          console.log(err)
          reject(err)
        } else if (result.length) {
          resolve(transformUtil.transformBasicCount(result))
        } else {
          console.log('No document(s) found with defined "find" criteria!')
          reject('No document(s) found with defined "find" criteria!')
        }
      })
  })
}

function search (queryJson, db, visualization, limit) {
  const src = visualization.source._id.toString()
  const {analyticParams = {}, visualizationType} = visualization
  const {name} = visualizationType
  const {toLatField, type} = analyticParams
  
  if (name === 'Map') {
    if (type === 'multiQuery') {
      return runMultipleQueries(db, visualization, limit)
        .then(function (results) {
          return transformUtil.transformLayeredMap(visualization, results)
        })
    } else if (toLatField != null) {
      return mongoUtil.queryMongo(db, src, queryJson, limit)
      .then(function (out) {
        return transformUtil.transformP2PMap(visualization, out)
      })
    } else {
      return mongoUtil.queryMongo(db, src, queryJson, limit)
      .then(function (out) {
        return transformUtil.transformMap(visualization, out)
      })
    }
  } else {
    return mongoUtil.queryMongo(db, src, queryJson, limit)
      .then(function (output) {
        return output
      })
  }
}

function detailedCount (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const {_id: src} = visualization.source
    const {groupBy, lowerLevel, topLevel} = visualization.analyticParams
    const collection = db.collection('' + src)
  
    collection.aggregate([{$match: queryJson}, {$limit: limit}, {$group: {_id: {groupBy}, 'subTotals': {$sum: 1}}}, {$group: {_id: topLevel, 'Count': {$sum: '$subTotals'}, 'Details': {'$push': {'Value': lowerLevel, 'Count': '$subTotals'}}}}],
      function (err, result) {
        if (err) {
          console.log(err)
          reject(err)
        } else if (result.length) {
          resolve(transformUtil.transformDetailed(result))
        } else {
          console.log('No document(s) found with defined "find" criteria!')
          reject('No document(s) found with defined "find" criteria!')
        }
      })
  })
}

function average (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const params = visualization.analyticParams.groupBy
    const averageOn = visualization.analyticParams.averageOn
    const collection = db.collection('' + src)
    
    collection.aggregate([{$match: queryJson}, {$limit: limit}, {$group: {_id: params, average: {$avg: averageOn}}}], function (err, result) {
      if (err) {
        console.log(err)
        reject(err)
      } else if (result.length) {
        resolve(transformUtil.transformBasicAverage(result))
      } else {
        console.log('No document(s) found with defined "find" criteria!')
        reject('No document(s) found with defined "find" criteria!')
      }
    })
  })
}

function summaryCount (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    
    return mongoUtil.queryMongo(db, src.toString(), queryJson, limit)
      .then(function (out) {
        resolve(transformUtil.transformSummaryCount(visualization, out))
      })
  })
}

function runMultipleQueries (db, visualization, limit) {
  const src = visualization.source._id.toString()
  const layers = visualization.analyticParams.outputTypeFilters
  
  return Promise.all(layers.map(function (layer) {
    const query = mongoUtil.buildFilterJson(layer.filter)
    
    return mongoUtil.labeledQueryMongo(db, src, query, layer.dataType, layer.name, limit)
  }))
}

function getSearchQueryLimit () {
  let limit

  if (config.searchquerylimit) {
    limit = config.searchquerylimit
  } else {
    limit = Number.MAX_SAFE_INTEGER
  }
  
  return limit
}

function getExecuteQueryLimit (visualization) {
  let limit
  
  if (visualization.queryLimit && visualization.queryLimit > 0) {
    limit = visualization.queryLimit
  } else if (visualization.visualizationType.queryLimit && visualization.visualizationType.queryLimit > 0) {
    limit = visualization.visualizationType.queryLimit
  } else {
    limit = Number.MAX_SAFE_INTEGER
  }
  
  return limit
}