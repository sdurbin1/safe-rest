const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Source = mongoose.model('Source')
const Analytic = mongoose.model('Analytic')

module.exports = router

/* PRELOADING OBJECTS */

/* :source param */
router.param('source', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Source, id, req, next, 'source')
})

/* :analytic param */
router.param('analytic', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Analytic, id, req, next, 'analytic')
})

/* END PRELOADING OBJECTS */

/* GET /sources */
router.get('/', (req, res, next) => {
  mongoUtils.returnResults(Source.find({}, 'name _id'), res, next)
})

/* GET /sources/:source */
router.get('/:source', (req, res, next) => {
  populateSource(req.source, res, next)
})

/* POST /sources */
router.post('/', (req, res, next) => {
  const source = new Source(req.body)

  populateSource(source.save(), res, next)
})

/* PUT /sources/:source */
router.put('/:source', (req, res, next) => {
  populateSource(
    Source.findOneAndUpdate({'_id': req.source._id}, req.body, {new: true}), res, next
  )
})

/* DELETE /sources/:source */
/* Delete source and delete all associated fields */
router.delete('/:source', (req, res, next) => {
  mongoUtils.removeModelObject(Source, req.source._id, res, next)
})

/* PUT /sources/:source/analytics */
/* Adds an existing analytic to a source */
router.put('/:source/analytics', (req, res, next) => {
  // first doing concat as req.body["analytics"] is not an array if only one element passed in
  const updatedAnalytics = [].concat(req.body['analytics'])
  
  req.source.analytics.push.apply(req.source.analytics, updatedAnalytics)
  
  populateSource(req.source.save(), res, next)
})

/* GET /sources/:source/analytics */
router.get('/:source/analytics', (req, res, next) => {
  req.source
    .populate('analytics')
    .execPopulate()
    .then(result => { res.json(result.analytics) })
    .catch(err => next(err))
})

/* DELETE /sources/:source/analytics/:analytic */
/* Removes an analytic from a source but does not delete the analytic */
router.delete('/:source/analytics/:analytic', (req, res, next) => {
  req.source.analytics.remove(req.analytic)
  
  populateSource(req.source.save(), res, next)
})

/* GET /sources/:source/fields */
router.get('/:source/fields', (req, res, next) => {
  res.json(req.source.fields)
})

const populateSource = (source, res, next) => (
   mongoUtils.populateAndReturnResults(
    source,
    'analytics',
    res,
    next
  )
)