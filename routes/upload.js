var express = require('express');
var router = express.Router();

var mongoUtil = require('../utils/mongoUtil');

var mongoose = require('mongoose')
var Source = mongoose.model('Source')

module.exports = router

/******** PRELOADING OBJECTS *************/

/* :source param */
router.param('source', function(req, res, next, id) {
  var query = Source.findById(id);

  query.exec(function (err, source){
    if (err) { return next(err); }
    if (!source) { return next(new Error('can\'t find source')); }

    req.source = source;
    return next();
  });
});

/******** END PRELOADING OBJECTS *********/


/* POST /sources/:source/data */
/* Upload document to existing source.  Also update field list if specified */
router.post('/:source/data', function(req, res, next) {
    var doc = req.body.document;
    var fields = req.body.fields;
    
    if(fields) {
        Source.findOneAndUpdate({ "_id": req.source._id }, {"fields": fields}, {new: true}, function(err, source) {
            if (err){ return next(err) }
            
            source.populate('analytics', function(err, source) {
                if(err){ return next(err); } 
              
                insertDocument(req.app.get('db'), source, doc, res)
            })
        })
    } else {
        insertDocument(req.app.get('db'), req.source, doc, res)
    }
});

/* POST /sources/data */
/* Create source and upload document */
router.post('/data', function(req, res, next) {
    var source = req.body.source
    var doc = req.body.document

    var source = new Source(source)
    
    source.save(function(err, source){
        if(err){ return next(err) }
    
        source.populate('analytics', function(err, source) {
            if(err){ return next(err) } 
          
            insertDocument(req.app.get('db'), source, doc, res)
        })
    })
})

/* GET /sources/:source/hasData */
router.get('/:source/hasData', function(req, res, next) {
    var sourceId = req.source._id.toString()
    
    mongoUtil.documentExists(req.app.get('db'), sourceId)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })    
})


/* DELETE /sources/:source/data */
/* Delete data associated with source */
router.delete('/:source/data', function(req, res, next) {
    var sourceId = req.source._id.toString()
 
    mongoUtil.deleteDocument(req.app.get('db'), sourceId)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })        
})


function insertDocument(db, source, doc, res) {
    mongoUtil.insertDocument(db, source._id.toString(), doc)
        .then((out) => res.json({"source": source, "upload": out}))
        .catch(error => {
            res.status(503).send(error)
        })
}