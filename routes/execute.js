var express = require('express')
var router = express.Router()
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var ObjectId = require('mongodb').ObjectID
var url = 'mongodb://localhost:27017/safe'

module.exports = router

var mongoose = require('mongoose')
var Visualization = mongoose.model('Visualization')

/************** PRELOAD OBJECTS ******************/

/* :visualization param */
router.param('visualization', function(req, res, next, id) {
  var query = Visualization.findById(id)

  query.exec(function (err, visualization){
    if (err) { return next(err) }
    if (!visualization) { return next(new Error('can\'t find visualization')) }

    req.visualization = visualization
    return next()
  })
})


/********** END PRELOADING OBJECTS ***********/

/* GET /visualizations */
router.get('/', function(req, res, next) {
  Visualization.find().populate(['visualizationType', 'analytic', 'source']).exec( function(err, visualizations){
    if(err){ return next(err) }
    res.json(visualizations)
  })
})

/* GET /visualizations/:visualization */
router.get('/:visualization', function(req, res, next) {
  req.visualization.populate(['visualizationType', 'analytic', 'source'], function(err, visualization) {
    if (err) { return next(err) }
    if (req.visualization.analytic.name== 'Count'){
      count(req.visualization, res)
    } else if (req.visualization.analytic.name=='Average'){
      average(req.visualization, res)
    } else if (req.visualization.analytic.name=='Detailed Count'){
      detailedCount(req.visualization, res)
    }
  })
})

function count(visualization, res){
  
      var src = visualization.source._id
      var params = visualization.analyticParams
    
      MongoClient.connect(url, function(err, db) {
      assert.equal(null, err)
      
      var collection = db.collection(''+src)

    collection.aggregate([{$group: { _id:params, count: { $sum : 1 } } }], function(err, result){
      if (err) {
        console.log(err)
      } else if (result.length) {
        res.json(result)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
   })
})
}

function detailedCount(visualization, res){
  
      var src = visualization.source._id
      var groupBy = visualization.analyticParams.groupBy
      var topLevel = visualization.analyticParams.topLevel
      var lowerLevel = visualization.analyticParams.lowerLevel
    
      MongoClient.connect(url, function(err, db) {
      assert.equal(null, err)
      
      var collection = db.collection(''+src)

   collection.aggregate([{ $group : { _id : {  groupBy }, "subTotals": { $sum : 1  }}},{ $group : { _id : topLevel, "count" : { $sum : "$subTotals" },  "Details" : {   "$push" : { "Race" : lowerLevel, "subtotal" : "$subTotals"  } }}}], function(err, result){  
      if (err) {
        console.log(err)
      } else if (result.length) {
        res.json(result)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
   })
})
}

function average(visualization, res){
  
      console.log("Visualization: "+visualization)
      var src = visualization.source._id
      var params = visualization.analyticParams.groupBy
      var averageOn = visualization.analyticParams.averageOn
    
      MongoClient.connect(url, function(err, db) {
      assert.equal(null, err)
      
      var collection = db.collection(''+src)

    collection.aggregate([{$group: { _id:params, count: { $avg : averageOn } } }], function(err, result){
      if (err) {
        console.log(err)
      } else if (result.length) {
        res.json(result)
      } else {
        console.log('No document(s) found with defined "find" criteria!')
      }
   })
})
}
