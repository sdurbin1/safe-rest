'use strict'
const mongoUtil = require('../utils/mongoUtil')
const transformUtil = require('../utils/transformUtil')

exports.mongoExecute = mongoExecute

function mongoExecute (queryJson, db, visualization) {
  return new Promise(function (resolve, reject) {
    visualization.populate(['visualizationType', 'analytic', 'source'], function (err, visualization) {
      if (err) { throw err }
      if (visualization.analytic.name === 'Count') {
        resolve(count(queryJson, db, visualization))
      } else if (visualization.analytic.name === 'Average') {
        resolve(average(queryJson, db, visualization))
      } else if (visualization.analytic.name === 'Detailed Count') {
        resolve(detailedCount(queryJson, db, visualization))
      } else {
        resolve(search(queryJson, db, visualization))
      }
    })
  })
}

function count (queryJson, db, visualization) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const params = visualization.analyticParams
    const collection = db.collection('' + src)
      
    collection.aggregate([{$match: queryJson}, {$group: {_id: params, count: {$sum: 1}}}], function (err, result) {
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

function search (queryJson, db, visualization) {
  const src = visualization.source._id.toString()
  
  if (visualization.visualizationType.name === 'Map') {
    if (visualization.analyticParams.type === 'multiQuery') {
      return runMultipleQueries(db, visualization).then(function (results) {
        const output = transformUtil.transformLayeredMap(visualization, results)
      
        return output
      })
    } else if (visualization.analyticParams.toLatField != null) {
      return mongoUtil.queryMongo(db, src, queryJson)
      .then(function (out) {
        const output = transformUtil.transformP2PMap(visualization, out)
      
        return output
      })
    } else {
      return mongoUtil.queryMongo(db, src, queryJson)
      .then(function (out) {
        const output = transformUtil.transformMap(visualization, out)
      
        return output
      })
    }
  } else {
    return mongoUtil.queryMongo(db, src, queryJson).then(function (output) {
      return output
    })
  }
}

function detailedCount (queryJson, db, visualization) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const groupBy = visualization.analyticParams.groupBy
    const topLevel = visualization.analyticParams.topLevel
    const lowerLevel = visualization.analyticParams.lowerLevel
    const collection = db.collection('' + src)
  
    collection.aggregate([{$match: queryJson}, {$group: {_id: {groupBy}, 'subTotals': {$sum: 1}}}, {$group: {_id: topLevel, 'Count': {$sum: '$subTotals'}, 'Details': {'$push': {'Value': lowerLevel, 'Count': '$subTotals'}}}}], function (err, result) {
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

function average (queryJson, db, visualization) {
  return new Promise(function (resolve, reject) {
    const src = visualization.source._id
    const params = visualization.analyticParams.groupBy
    const averageOn = visualization.analyticParams.averageOn
    const collection = db.collection('' + src)
  
    collection.aggregate([{$match: queryJson}, {$group: {_id: params, average: {$avg: averageOn}}}], function (err, result) {
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

function runMultipleQueries (db, visualization) {
  const src = visualization.source._id.toString()
  const layers = visualization.analyticParams.outputTypeFilters
  
  return Promise.all(layers.map(function (layer) {
    const query = mongoUtil.buildFilterJson(layer.filter)
    
    return mongoUtil.labeledQueryMongo(db, src, query, layer.dataType, layer.name)
  }))
}