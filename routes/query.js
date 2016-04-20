var express = require('express')
var router = express.Router()

var mongoUtil = require('../utils/mongoUtil')

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

/* GET /sources/:source/query */
router.post('/:source/query', function(req, res, next) { 
    var sourceId = req.source._id.toString()
    var filters = req.body.filters
    
    var queryJson = mongoUtil.buildQueryJson(filters)

    mongoUtil.queryMongo(req.app.get('db'), sourceId, queryJson)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })
        
})