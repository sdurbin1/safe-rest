const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Analytic = mongoose.model('Analytic')
const VisualizationType = mongoose.model('VisualizationType')

module.exports = router

/* PRELOAD OBJECTS */

/* :analytic param */
router.param('analytic', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Analytic, id, req, next, 'analytic')
})

/* :visualizationType param */
router.param('visualizationType', (req, res, next, id) => {
  mongoUtils.populateRouterParam(VisualizationType, id, req, next, 'visualizationType')
})

/* END PRELOADING OBJECTS */

/* GET /analytics */
router.get('/', (req, res, next) => {
  mongoUtils.getAllModelObject(Analytic, res, next)
})

/* POST /analytics */
router.post('/', (req, res, next) => {
  const analytic = new Analytic(req.body)

  populateAnalytic(analytic.save(), res, next)
})

/* GET /analytics/:analytic */
router.get('/:analytic', (req, res, next) => {
  populateAnalytic(req.analytic, res, next)
})

/* PUT /analytics/:analytic */
router.put('/:analytic', (req, res, next) => {
  populateAnalytic(
    Analytic.findOneAndUpdate({'_id': req.analytic._id}, req.body, {new: true}),
    res,
    next
  )
})

/* DELETE /analytics/:analytic */
router.delete('/:analytic', (req, res, next) => {
  mongoUtils.removeModelObject(Analytic, req.analytic._id, res, next)
})

/* GET /analytics/:analytic/visualization_types */
router.get('/:analytic/visualization-types', (req, res, next) => {
  populateAnalyticVizTypes(req.analytic, res, next)
})

/* PUT /analytics/:analytic/visualization_types */
/* Adds an existing visualizationType to an analytic */
router.put('/:analytic/visualization-types', (req, res, next) => {
  // first doing concat as req.body["visualizaitonTypes"] is not an array if only one element passed in
  const updatedVisualizationTypes = [].concat(req.body['visualizationTypes'])

  req.analytic.visualizationTypes.push.apply(req.analytic.visualizationTypes, updatedVisualizationTypes)
  populateAnalytic(req.analytic.save(), res, next)
})

/* DELETE /analytics/:analytic/visualization-types/:visualizationType */
/* Removes a visualization from an analytic but doesn't delete it */
router.delete('/:analytic/visualization-types/:visualizationType', (req, res, next) => {
  req.analytic.visualizationTypes.remove(req.visualizationType)
  populateAnalyticVizTypes(req.analytic.save(), res, next)
})

const populateAnalytic = (analytic, res, next) => (
  mongoUtils.populateAndReturnResults(analytic, 'visualizationTypes', res, next)
)

const populateAnalyticVizTypes = (analytic, res, next) => (
  mongoUtils.populate(analytic, 'visualizationTypes')
    .then(result => { res.json(result.visualizationTypes) })
    .catch(err => next(err))
)