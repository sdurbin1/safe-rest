const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Source = mongoose.model('Source')

module.exports = router

/* PRELOADING OBJECTS */

/* :source param */
router.param('source', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Source, id, req, next, 'source')
})

/* END PRELOADING OBJECTS */

/* GET /sources/:source/query */
router.post('/:source/query', (req, res, next) => {
  req.source.query(req.body, req.app.get('db'), req.session)
    .then(out => res.json(out))
    .catch(error => { res.status(503).send(error) })
})
