'use strict'
const express = require('express')
const router = express.Router()
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
  req.visualization.execute(req.body, req.app.get('db')).then(function (out) {
    res.json(out)
  }).catch(function (error) {
    res.status(503).send(error)
  })
})
