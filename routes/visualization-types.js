const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const VisualizationType = mongoose.model('VisualizationType')

module.exports = router

/* PRELOADING OBJECTS */

/* :visualization-type param */
router.param('visualizationType', (req, res, next, id) => {
  mongoUtils.populateRouterParam(VisualizationType, id, req, next, 'visualizationType')
})

/* END PRELOADING OBJECTS */

/* GET /visualization-types */
router.get('/', (req, res, next) => {
  mongoUtils.getAllModelObject(VisualizationType, res, next)
})

/* POST /visualization-types */
router.post('/', (req, res, next) => {
  mongoUtils.saveModelObject(VisualizationType, res, req, next)
})

/* GET /visualization-types/:visualizationType */
router.get('/:visualizationType', (req, res, next) => {
  res.json(req.visualizationType)
})

/* PUT /visualization-types/:visualizationType */
router.put('/:visualizationType', (req, res, next) => {
  mongoUtils.returnResults(
    VisualizationType.findOneAndUpdate({'_id': req.visualizationType._id}, req.body, {new: true}),
    res,
    next
  )
})

/* DELETE /visualization-types/:visualizationType */
router.delete('/:visualizationType', (req, res, next) => {
  mongoUtils.removeModelObject(VisualizationType, req.visualizationType._id, res, next)
})