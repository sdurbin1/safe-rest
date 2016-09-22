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

/* POST /sources/:source/data */
/* Upload document to existing source.  Also update field list if specified */
router.post('/:source/data', (req, res, next) => {
  const {document: doc} = req.body
  const {fields} = req.body
    
  if (fields) {
    Source
      .findOneAndUpdate({'_id': req.source._id}, {'fields': fields}, {new: true})
      .then(source => source.populate('analytics'))
      .then(source => {
        insertDocument(req.app.get('db'), source, doc, res)
      })
      .catch(err => next(err))
  } else {
    insertDocument(req.app.get('db'), req.source, doc, res)
  }
})

/* POST /sources/data */
/* Create source and upload document */
router.post('/data', (req, res, next) => {
  const doc = req.body.document
  const sourceJson = req.body.source

  const source = new Source(sourceJson)
  
  source
    .save()
    .then(source => source.populate('analytics'))
    .then(source => {
      insertDocument(req.app.get('db'), source, doc, res)
    })
    .catch(err => next(err))
})

/* GET /sources/:source/hasData */
router.get('/:source/hasData', (req, res, next) => {
  const sourceId = req.source._id.toString()

  mongoUtils.documentExists(req.app.get('db'), sourceId)
    .then(out => res.json(out))
    .catch(error => {
      res.status(503).send(error)
    })
})

/* DELETE /sources/:source/data */
/* Delete data associated with source */
router.delete('/:source/data', (req, res, next) => {
  const sourceId = req.source._id.toString()
 
  mongoUtils.deleteDocument(req.app.get('db'), sourceId)
    .then(out => res.json(out))
    .catch(error => {
      res.status(503).send(error)
    })
})

const insertDocument = (db, source, doc, res) => {
  mongoUtils.insertDocument(db, source._id.toString(), doc)
   .then((out) => res.json({'source': source, 'upload': out}))
   .catch(error => {
     res.status(503).send(error)
   })
}