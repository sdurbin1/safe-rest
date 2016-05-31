'use strict'
const express = require('express')
const router = express.Router()
const mongoUtil = require('../utils/mongoUtil')
const transformUtil = require('../utils/transformUtil')

module.exports = router

const mongoose = require('mongoose')
const Visualization = mongoose.model('Visualization')

/* PRELOAD OBJECTS */

/* :visualization param */
router.param('visualization', function (req, res, next, id) {
  const query = Visualization.findById(id)

  query.exec(function (err, visualization) {
    if (err) { return next(err) }
    if (!visualization) { return next(new Error('can\'t find visualization')) }

    req.visualization = visualization
    
    return next()
  })
})

/* END PRELOADING OBJECTS */

/* GET /visualizations */
router.get('/', function (req, res, next) {
  Visualization.find().populate(['visualizationType', 'analytic', 'source']).exec(function (err, visualizations) {
    if (err) { return next(err) }
    
    res.json(visualizations)
  })
})

/* GET /visualizations/:visualization */
router.post('/:visualization', function (req, res, next) {
  const queryJson = mongoUtil.buildQueryJson(req.body.filters)
  
  req.visualization.populate(['visualizationType', 'analytic', 'source'], function (err, visualization) {
    if (err) { return next(err) }
    if (req.visualization.analytic.name === 'Count') {
      count(req, res, queryJson)
    } else if (req.visualization.analytic.name === 'Average') {
      average(req, res, queryJson)
    } else if (req.visualization.analytic.name === 'Detailed Count') {
      detailedCount(req, res, queryJson)
    } else {
      search(req, res, queryJson)
    }
  })
})

function count (req, res, queryJson) {
  const src = req.visualization.source._id
  const params = req.visualization.analyticParams
  const collection = req.app.get('db').collection('' + src)
    
  collection.aggregate([{$match: queryJson}, {$group: {_id: params, count: {$sum: 1}}}], function (err, result) {
    if (err) {
      console.log(err)
    } else if (result.length) {
      const out = transformUtil.transformBasicCount(result)
       
      res.json(out)
    } else {
      console.log('No document(s) found with defined "find" criteria!')
    }
  })
}

function search (req, res, queryJson) {
  const src = req.visualization.source._id.toString()
  
  if (req.visualization.visualizationType.name === 'Map') {
    if (req.visualization.analyticParams.type === 'multiQuery') {
      runMultipleQueries(req).then(function (results) {
        const output = transformUtil.transformLayeredMap(req.visualization, results)
      
        res.json(output)
      })
    } else if (req.visualization.analyticParams.toLatField != null) {
      mongoUtil.queryMongo(req.app.get('db'), src, queryJson)
      .then(function (out) {
        const output = transformUtil.transformP2PMap(req.visualization, out)
      
        res.json(output)
      })
      .catch(error => {
        res.status(503).send(error)
      })
    } else {
      mongoUtil.queryMongo(req.app.get('db'), src, queryJson)
      .then(function (out) {
        const output = transformUtil.transformMap(req.visualization, out)
      
        res.json(output)
      })
      .catch(error => {
        res.status(503).send(error)
      })
    }
  } else {
    mongoUtil.queryMongo(req.app.get('db'), src, queryJson)
    .then((out) => res.json(out))
    .catch(error => {
      res.status(503).send(error)
    })
  }
}

function detailedCount (req, res, queryJson) {
  const src = req.visualization.source._id
  const groupBy = req.visualization.analyticParams.groupBy
  const topLevel = req.visualization.analyticParams.topLevel
  const lowerLevel = req.visualization.analyticParams.lowerLevel
  const collection = req.app.get('db').collection('' + src)

  collection.aggregate([{$match: queryJson}, {$group: {_id: {groupBy}, 'subTotals': {$sum: 1}}}, {$group: {_id: topLevel, 'Count': {$sum: '$subTotals'}, 'Details': {'$push': {'Value': lowerLevel, 'Count': '$subTotals'}}}}], function (err, result) {
    if (err) {
      console.log(err)
    } else if (result.length) {
      const out = transformUtil.transformDetailed(result)
     
      res.json(out)
    } else {
      console.log('No document(s) found with defined "find" criteria!')
    }
  })
}

function average (req, res, queryJson) {
  const src = req.visualization.source._id
  const params = req.visualization.analyticParams.groupBy
  const averageOn = req.visualization.analyticParams.averageOn
  const collection = req.app.get('db').collection('' + src)

  collection.aggregate([{$match: queryJson}, {$group: {_id: params, average: {$avg: averageOn}}}], function (err, result) {
    if (err) {
      console.log(err)
    } else if (result.length) {
      const out = transformBasicAverage(result)
     
      res.json(out)
    } else {
      console.log('No document(s) found with defined "find" criteria!')
    }
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

function runMultipleQueries (req) {
  const src = req.visualization.source._id.toString()
  const layers = req.visualization.analyticParams.outputTypeFilters
  const db = req.app.get('db')
  
  return Promise.all(layers.map(function (layer) {
    const query = mongoUtil.buildFilterJson(layer.filter)
    
    return mongoUtil.labeledQueryMongo(db, src, query, layer.dataType, layer.name)
  }))
}