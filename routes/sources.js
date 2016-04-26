var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Source = mongoose.model('Source');
var Analytic = mongoose.model('Analytic');


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

/* :analytic param */
router.param('analytic', function(req, res, next, id) {
  var query = Analytic.findById(id);

  query.exec(function (err, analytic){
    if (err) { return next(err); }
    if (!analytic) { return next(new Error('can\'t find analytic')); }

    req.analytic = analytic;
    return next();
  });
});

/******** END PRELOADING OBJECTS *********/

/* GET /sources */
router.get('/', function(req, res, next) {
  Source.find().populate('analytics').exec( function(err, sources){
    if(err){ return next(err); }

    res.json(sources);
  });
});

/* GET /sources/:source */
router.get('/:source', function(req, res, next) {
  req.source.populate('analytics', function(err, source) {
    if (err) { return next(err); }

    res.json(source);
  });
});

/* POST /sources */
router.post('/', function(req, res, next) {
  var source = new Source(req.body);

  source.save(function(err, source){
    if(err){ return next(err); }

    source.populate('analytics', function(err, source) {
      if(err){ return next(err); } 
      
      res.json(source);
    });
  });
});

/* PUT /sources/:source */
router.put('/:source', function(req, res, next) {
  Source.findOneAndUpdate({ "_id": req.source._id }, req.body, {new: true}, function(err, source) {
    if (err){ return next(err); };

    source.populate('analytics', function(err, source) {
      if(err){ return next(err); } 
      
      res.json(source);
    });
  });
});

/* DELETE /sources/:source */
/* Delete source and delete all associated fields */
router.delete('/:source', function(req, res, next) {
  Source.find({ "_id": req.source._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});

/* PUT /sources/:source/analytics */
/* Adds an existing analytic to a source */
router.put('/:source/analytics', function(req, res, next) {  
  //first doing concat as req.body["analytics"] is not an array if only one element passed in
  var updated_analytics = [].concat(req.body["analytics"])
  req.source.analytics.push.apply(req.source.analytics, updated_analytics)
  req.source.save(function(err, source) {
    if(err){ return next(err); }

    source.populate('analytics', function(err, source) {
      if(err){ return next(err); } 
      
      res.json(source);
    });
  });
});

/* GET /sources/:source/analytics */
router.get('/:source/analytics', function(req, res, next) {  
  req.source.populate('analytics', function(err, source) {
    if (err) { return next(err); }

    res.json(source.analytics);
  });
});

/* DELETE /sources/:source/analytics/:analytic */
/* Removes an analytic from a source but does not delete the analytic */
router.delete('/:source/analytics/:analytic', function(req, res, next) {
  req.source.analytics.remove(req.analytic);
  req.source.save(function(err, source) {
    if(err){ return next(err); }

    source.populate('analytics', function(err, source) {
      if(err){ return next(err); } 
      
      res.json(source);
    });
  });
});







