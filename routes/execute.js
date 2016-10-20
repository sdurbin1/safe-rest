'use strict'
const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Visualization = mongoose.model('Visualization')

module.exports = router

/* PRELOAD OBJECTS */

/* :visualization param */
router.param('visualization', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Visualization, id, req, next, 'visualization')
})

/* END PRELOADING OBJECTS */

/* GET /visualizations */
router.get('/', (req, res, next) => {
  mongoUtils.returnResults(
    Visualization
      .find()
      .populate(['visualizationType', 'analytic', 'source'])
      .execPopulate(),
    res,
    next
  )
})

/* GET /visualizations/:visualization */
router.post('/:visualization', (req, res, next) => {
  req.visualization
    .execute(req.body, req.app.get('db'), req.session)
    .then(out => { res.json(out) })
    .catch(function (error) { res.status(503).send(error) })
})
