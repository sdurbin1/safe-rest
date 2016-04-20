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


/* POST /sources/:source/upload */
router.post('/:source/upload', function(req, res, next) {
    var sourceId = req.source._id.toString();
    var doc = req.body.document;
    
    mongoUtil.insertDocument(req.app.get('db'), sourceId, doc)
        .then((out) => res.json(out))
        .catch(error => {
            res.status(503).send(error)
        })

});