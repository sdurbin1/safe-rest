const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')
const Analytic = mongoose.model('Analytic')
const VisualizationType = mongoose.model('VisualizationType')

/* PRELOAD OBJECTS */

/* :analytic param */
router.param('analytic', function (req, res, next, id) {
  const query = Analytic.findById(id)

  query.exec(function (err, analytic) {
    if (err) { return next(err) }
    if (!analytic) { return next(new Error('can\'t find analytic')) }

    req.analytic = analytic

    return next()
  })
})

/* :visualizationType param */
router.param('visualizationType', function (req, res, next, id) {
  const query = VisualizationType.findById(id)

  query.exec(function (err, visualizationType) {
    if (err) { return next(err) }
    if (!visualizationType) { return next(new Error('can\'t find visualization-type')) }

    req.visualizationType = visualizationType

    return next()
  })
})

/* END PRELOADING OBJECTS */

/* GET /analytics */
router.get('/', function (req, res, next) {
  Analytic.find().populate('visualizationTypes').exec(function (err, analytics) {
    if (err) { return next(err) }

    res.json(analytics)
  })
})

/* POST /analytics */
router.post('/', function (req, res, next) {
  const analytic = new Analytic(req.body)

  analytic.save(function (err, analytic) {
    if (err) { return next(err) }

    analytic.populate('visualizationTypes', function (err, analytic) {
      if (err) { return next(err) }

      res.json(analytic)
    })
  })
})

/* GET /analytics/:analytic */
router.get('/:analytic', function (req, res, next) {
  req.analytic.populate('visualizationTypes', function (err, analytic) {
    if (err) { return next(err) }

    res.json(analytic)
  })
})

/* PUT /analytics/:analytic */
router.put('/:analytic', function (req, res, next) {
  Analytic.findOneAndUpdate({'_id': req.analytic._id}, req.body, {new: true}).populate('visualizationTypes').exec(function (err, analytic) {
    if (err) { return next(err) }

    res.json(analytic)
  })
})

/* DELETE /analytics/:analytic */
router.delete('/:analytic', function (req, res, next) {
  Analytic.find({'_id': req.analytic._id}).remove(function (err) {
    if (err) { return next(err) }

    res.json({})
  })
})

/* GET /analytics/:analytic/visualization_types */
router.get('/:analytic/visualization-types', function (req, res, next) {
  req.analytic.populate('visualizationTypes', function (err, analytic) {
    if (err) { return next(err) }

    res.json(analytic.visualizationTypes)
  })
})

/* PUT /analytics/:analytic/visualization_types */
/* Adds an existing visualizationType to an analytic */
router.put('/:analytic/visualization-types', function (req, res, next) {
  // first doing concat as req.body["visualizaitonTypes"] is not an array if only one element passed in
  const updatedVisualizationTypes = [].concat(req.body['visualizationTypes'])

  req.analytic.visualizationTypes.push.apply(req.analytic.visualizationTypes, updatedVisualizationTypes)
  req.analytic.save(function (err, analytic) {
    if (err) { return next(err) }

    analytic.populate('visualizationTypes', function (err, analytic) {
      if (err) { return next(err) }

      res.json(analytic.visualizationTypes)
    })
  })
})

/* DELETE /analytics/:analytic/visualization-types/:visualizationType */
/* Removes a visualization from an analytic but doesn't delete it */
router.delete('/:analytic/visualization-types/:visualizationType', function (req, res, next) {
  req.analytic.visualizationTypes.remove(req.visualizationType)
  req.analytic.save(function (err, analytic) {
    if (err) { return next(err) }

    analytic.populate('visualizationTypes', function (err, analytic) {
      if (err) { return next(err) }

      res.json(analytic.visualizationTypes)
    })
  })
})
