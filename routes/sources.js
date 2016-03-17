var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Source = mongoose.model('Source');
var Field = mongoose.model('Field');

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

/* :field param */
router.param('field', function(req, res, next, id) {
  var query = Field.findById(id);

  query.exec(function (err, field){
    if (err) { return next(err); }
    if (!field) { return next(new Error('can\'t find field')); }

    req.field = field;
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

/* PUT /sources/:source/analytics */
/* Adds an existing visualization to an analytic */
router.put('/:source/analytics', function(req, res, next) {  
  //first doing concat as req.body["analytics"] is not an array if only one element passed in
  var updated_analytics = [].concat(req.body["analytics"])
  req.source.analytics.push.apply(req.source.analytics, updated_analytics)
  req.source.save(function(err, source) {
    if(err){ return next(err); }

    res.json(source.analytics);
  });
});

/* GET /sources/:source/analytics */
router.get('/:source/analytics', function(req, res, next) {
  req.source.populate('analytics', function(err, source) {
    if (err) { return next(err); }

    res.json(source.analytics);
  });
});

/* POST /sources/:source/fields */
router.post('/:source/fields', function(req, res, next) {
  var field = new Field(req.body);
  field.source = req.source;

  field.save(function(err, field){
    if(err){ return next(err); }

    req.source.fields.push(field);
    req.source.save(function(err, source) {
      if(err){ return next(err); }

      res.json(field);
    });
  });
});

/* GET /sources/:source/fields */
router.get('/:source/fields', function(req, res, next) {
  //res.json(req.source.fields);
  
  req.source.populate('fields', function(err, source) {
    if (err) { return next(err); }

    res.json(source.fields);
  });
});




