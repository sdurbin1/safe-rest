var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Source = mongoose.model('Source');

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

/* GET /sources */
router.get('/', function(req, res, next) {
  Source.find(function(err, sources){
    if(err){ return next(err); }

    res.json(sources);
  });
});

/* GET /sources/:source */
router.get('/:source', function(req, res, next) {
  res.json(req.source);
  /*req.source.populate('analytics', function(err, source) {
    if (err) { return next(err); }

    res.json(source);
  });*/
});

/* POST /sources */
router.post('/', function(req, res, next) {
  var source = new Source(req.body);

  source.save(function(err, source){
    if(err){ return next(err); }

    res.json(source);
  });
});

/* GET /sources/:source/analytics */
router.get('/:source/analytics', function(req, res, next) {
  req.source.populate('analytics', function(err, source) {
    if (err) { return next(err); }

    res.json(source.analytics);
  });
});

/* GET /sources/:source/fields */
router.get('/:source/fields', function(req, res, next) {
  res.json(req.source.fields);
});





