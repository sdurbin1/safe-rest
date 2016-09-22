const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Visualization = mongoose.model('Visualization')
const VisualizationType = mongoose.model('VisualizationType')

module.exports = router

/* PRELOAD OBJECTS */

/* :visualization param */
router.param('visualization', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Visualization, id, req, next, 'visualization')
})

/* :visualization-type param */
router.param('visualizationType', (req, res, next, id) => {
  mongoUtils.populateRouterParam(VisualizationType, id, req, next, 'visualizationType')
})

/* END PRELOADING OBJECTS */

/* GET /visualizations */
router.get('/', (req, res, next) => {
  populateVisualization(Visualization.find(), res, next)
})

/* POST /visualizations */
router.post('/', (req, res, next) => {
  const visualization = new Visualization(req.body)

  populateVisualization(visualization.save(), res, next)
})

/* GET /visualizations/:visualization */
router.get('/:visualization', (req, res, next) => {
  populateVisualization(req.visualization, res, next)
})

/* PUT /visualizations/:visualization */
router.put('/:visualization', (req, res, next) => {
  populateVisualization(
    Visualization.findOneAndUpdate({'_id': req.visualization._id}, req.body, {new: true}),
    res,
    next
  )
})

/* DELETE /visualizations/:visualization */
router.delete('/:visualization', (req, res, next) => {
  mongoUtils.removeModelObject(Visualization, req.visualization._id, res, next)
})

const populateVisualization = (visualization, res, next) => (
  mongoUtils.populateAndReturnResults(
    visualization,
    ['visualizationType', 'analytic', 'source'],
    res,
    next
  )
)