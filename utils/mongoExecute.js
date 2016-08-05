'use strict'
const mongoUtil = require('../utils/mongoUtil')
const Promise = require('bluebird')
const transformUtil = require('../utils/transformUtil')
const config = require('../config')

exports.mongoExecute = mongoExecute
exports.mongoQuery = mongoQuery

function mongoExecute (requestBody, db, visualization) {
  return new Promise(function (resolve, reject) {
    const queryJson = mongoUtil.buildQueryJson(requestBody.filters)

    visualization.populate(['visualizationType', 'analytic', 'source'], function (err, visualization) {
      if (err) { throw err }
      
      const limit = getExecuteQueryLimit(visualization)
      
      if (visualization.analytic.name === 'Count') {
        resolve(count(queryJson, db, visualization, limit))
      } else if (visualization.analytic.name === 'Average') {
        resolve(average(queryJson, db, visualization, limit))
      } else if (visualization.analytic.name === 'Detailed Count') {
        resolve(detailedCount(queryJson, db, visualization, limit))
      } else if (visualization.visualizationType.name === 'Summary') {
        resolve(summaryCount(queryJson, db, visualization, limit))
      } else {
        resolve(search(queryJson, db, visualization, limit))
      }
    })
  })
}

function mongoQuery (requestBody, db, source) {
  const queryJson = mongoUtil.buildQueryJson(requestBody.filters)
  const sourceId = source._id.toString()
  const limit = getSearchQueryLimit()

  return mongoUtil.queryMongo(db, sourceId, queryJson, limit)
}

function count (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const params = visualization.analyticParams
    const collection = db.collection('' + src)
      
    collection.aggregate([{$match: queryJson}, {$limit: limit}, {$group: {_id: params, count: {$sum: 1}}}], function (err, result) {
      if (err) {
        console.log(err)
        reject(err)
      } else if (result.length) {
        const out = transformUtil.transformBasicCount(result)
         
        resolve(out)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
        reject('No document(s) found with defined "find" criteria!')
      }
    })
  })
}

function search (queryJson, db, visualization, limit) {
  const src = visualization.source._id.toString()
  
  if (visualization.visualizationType.name === 'Map') {
    if (visualization.analyticParams.type === 'multiQuery') {
      return runMultipleQueries(db, visualization, limit).then(function (results) {
        const output = transformUtil.transformLayeredMap(visualization, results)
      
        return output
      })
    } else if (visualization.analyticParams.toLatField != null) {
      return mongoUtil.queryMongo(db, src, queryJson, limit)
      .then(function (out) {
        const output = transformUtil.transformP2PMap(visualization, out)
      
        return output
      })
    } else {
      return mongoUtil.queryMongo(db, src, queryJson, limit)
      .then(function (out) {
        const output = transformUtil.transformMap(visualization, out)
      
        return output
      })
    }
  } else {
    return mongoUtil.queryMongo(db, src, queryJson, limit).then(function (output) {
      return output
    })
  }
}

function detailedCount (queryJson, db, visualization, limit) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const groupBy = visualization.analyticParams.groupBy
    const topLevel = visualization.analyticParams.topLevel
    const lowerLevel = visualization.analyticParams.lowerLevel
    const collection = db.collection('' + src)
  
    collection.aggregate([{$match: queryJson}, {$limit: limit}, {$group: {_id: {groupBy}, 'subTotals': {$sum: 1}}}, {$group: {_id: topLevel, 'Count': {$sum: '$subTotals'}, 'Details': {'$push': {'Value': lowerLevel, 'Count': '$subTotals'}}}}], function (err, result) {
      if (err) {
        console.log(err)
        reject(err)
      } else if (result.length) {
        const out = transformUtil.transformDetailed(result)
       
        resolve(out)
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
        const out = transformBasicAverage(result)
       
        resolve(out)
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
        const output = transformUtil.transformSummaryCount(visualization, out)
      
        resolve(output)
      })
  })
}

function transformBasicAverage (raw) {
  const output = []
  
  for (let i = 0; i < raw.length; i = i + 1) {
    const record = {}
    
    for (const k in raw[i]['_id']) {
      record['Value'] = raw[i]['_id'][k]
    }
        
    record['Average'] = raw[i].average
    output.push(record)
  }
  
  return output
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
