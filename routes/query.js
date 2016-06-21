const express = require('express')
const router = express.Router()

const mongoUtil = require('../utils/mongoUtil')

const mongoose = require('mongoose')
const Source = mongoose.model('Source')

module.exports = router

/* PRELOADING OBJECTS */

/* :source param */
router.param('source', function (req, res, next, id) {
  const query = Source.findById(id)

  query.exec(function (err, source) {
    if (err) { return next(err) }
    if (!source) { return next(new Error('can\'t find source')) }

    req.source = source
    
    return next()
  })
})

/* END PRELOADING OBJECTS */

/* GET /sources/:source/query */
router.post('/:source/query', function (req, res, next) {
  const sourceId = req.source._id.toString()
  const filters = req.body.filters
    
  const queryJson = mongoUtil.buildQueryJson(filters)
  const limit = Number.MAX_SAFE_INTEGER

  mongoUtil.queryMongo(req.app.get('db'), sourceId, queryJson, limit)
    .then((out) => res.json(out))
    .catch(error => {
      res.status(503).send(error)
    })
})
