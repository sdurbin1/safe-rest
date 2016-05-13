const express = require('express')
const router = express.Router()
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')
const url = 'mongodb://localhost:27017/safe'
const mongoUtil = require('../utils/mongoUtil')

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
      count(req.visualization, res, queryJson)
    } else if (req.visualization.analytic.name === 'Average') {
      average(req.visualization, res, queryJson)
    } else if (req.visualization.analytic.name === 'Detailed Count') {
      detailedCount(req.visualization, res, queryJson)
    }
  })
})

function count (visualization, res, queryJson) {
  const src = visualization.source._id
  const params = visualization.analyticParams
    
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err)
        
    const collection = db.collection('' + src)
  
    collection.aggregate([{$match: queryJson}, {$group: {_id: params, count: {$sum: 1}}}], function (err, result) {
      if (err) {
        console.log(err)
      } else if (result.length) {
       var out = transformBasic(result)
        res.json(out)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
    })
  })
}

function detailedCount (visualization, res, queryJson) {
  const src = visualization.source._id
  const groupBy = visualization.analyticParams.groupBy
  const topLevel = visualization.analyticParams.topLevel
  const lowerLevel = visualization.analyticParams.lowerLevel
    
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err)
      
    const collection = db.collection('' + src)

    collection.aggregate([{$match: queryJson}, {$group: {_id: {groupBy}, 'subTotals': {$sum: 1}}}, {$group: {_id: topLevel, 'Count': {$sum: '$subTotals'}, 'Details': {'$push': {'Value': lowerLevel, 'Count': '$subTotals'}}}}], function (err, result) {
      if (err) {
        console.log(err)
      } else if (result.length) {
       var out = transformDetailed(result)
        res.json(out)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
    })
  })
}

function average (visualization, res, queryJson) {
  const src = visualization.source._id
  const params = visualization.analyticParams.groupBy
  const averageOn = visualization.analyticParams.averageOn
    
  MongoClient.connect(url, function (err, db) {
    assert.equal(null, err)
      
    const collection = db.collection('' + src)

    collection.aggregate([{$match: queryJson}, {$group: {_id: params, count: {$avg: averageOn}}}], function (err, result) {
      if (err) {
        console.log(err)
      } else if (result.length) {
       var out = transformBasic(result)
        res.json(out)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
    })
  })
}


function transformBasic (raw) {
  const output = []
  
  for (var i=0; i < raw.length; i=i+1){
    var record = {}
    for (var k in raw[i]['_id']){
      console.log(k)
      record["Value"] = raw[i]['_id'][k]
    }
        
    record["Count"] = raw[i].count
    output.push(record)
  }
  
  return output
}


function transformDetailed (raw) {
  const output = []
  
  for (var i=0; i < raw.length; i=i+1){
    var record = {}
    record["Value"] = raw[i]._id
    record["Details"] = raw[i].Details
    record["Count"] = raw[i].Count
    output.push(record)
  }
  
  return output
}