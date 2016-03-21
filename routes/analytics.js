var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Analytic = mongoose.model('Analytic');
var AnalyticParam = mongoose.model('AnalyticParam');
var Visualization = mongoose.model('Visualization');

/************** PRELOAD OBJECTS ******************/

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

/* :param param */
router.param('param', function(req, res, next, id) {
  var query = AnalyticParam.findById(id);

  query.exec(function (err, analyticParam){
    if (err) { return next(err); }
    if (!analyticParam) { return next(new Error('can\'t find analytic param')); }

    req.analyticParam = analyticParam;
    return next();
  });
});

/* :visualization param */
router.param('visualization', function(req, res, next, id) {
  var query = Visualization.findById(id);

  query.exec(function (err, visualization){
    if (err) { return next(err); }
    if (!visualization) { return next(new Error('can\'t find visualization')); }

    req.visualization = visualization;
    return next();
  });
});

/********** END PRELOADING OBJECTS ***********/

/* GET /analytics */
router.get('/', function(req, res, next) {
  Analytic.find(function(err, analytics){
    if(err){ return next(err); }

    res.json(analytics);
  });
});

/* POST /analytics */
router.post('/', function(req, res, next) {
  var analytic = new Analytic(req.body);

  analytic.save(function(err, analytic){
    if(err){ return next(err); }

    res.json(analytic);
  });
});

/* GET /analytics/:analytic */
router.get('/:analytic', function(req, res, next) {
  req.analytic.populate(['visualizations','analyticParams'], function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic);
  });
});

/* PUT /analytics/:analytic */
router.put('/:analytic', function(req, res, next) {
  Analytic.findOneAndUpdate({ "_id": req.analytic._id }, req.body, {new: true}, function(err, analytic) {
    if (err){ return next(err); };

    res.json(analytic);
  });
});

/* DELETE /analytics/:analytic */
router.delete('/:analytic', function(req, res, next) {
  Analytic.find({ "_id": req.analytic._id }).remove( function(err) {
    if(err){ return next(err); };

    /* Remove associated analyticParams */
    AnalyticParam.find({ analytic : req.analytic._id }).remove().exec();
  
    res.json({});
  });
});


/* POST /analytics/:analytic/params */
router.post('/:analytic/params', function(req, res, next) {
  var analyticParam = new AnalyticParam(req.body);
  analyticParam.analytic = req.analytic;

  analyticParam.save(function(err, analyticParam){
    if(err){ return next(err); }

    req.analytic.analyticParams.push(analyticParam);
    req.analytic.save(function(err, analytic) {
      if(err){ return next(err); }

      res.json(analyticParam);
    });
  });
});

/* GET /analytics/:analytic/params */
router.get('/:analytic/params', function(req, res, next) {
  req.analytic.populate('analyticParams', function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic.analyticParams);
  });
});

/* DELETE /analytics/:analytic/params/:param */
router.delete('/:analytic/params/:param', function(req, res, next) {
  AnalyticParam.find({ "_id": req.analyticParam._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});

/* TODO: Should we just have this route as /params/:param? */
/* GET /analytics/:analytic/params/:param */
/*router.get('/:analytic/params/:param', function(req, res, next) {
  if(req.analytic.analyticParams.indexOf(req.analyticParam._id) === -1) { 
    return next(new Error("can't find analyticParam associated with analytic")); 
  }
  res.json(req.analyticParam);
});*/


/* GET /analytics/:analytic/visualizations */
router.get('/:analytic/visualizations', function(req, res, next) {
  req.analytic.populate('visualizations', function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic.visualizations);
  });
});

/* PUT /analytics/:analytic/visualizations */
/* Adds an existing visualization to an analytic */
router.put('/:analytic/visualizations', function(req, res, next) {  
  //first doing concat as req.body["visualizaitons"] is not an array if only one element passed in
  var updated_visualizations = [].concat(req.body["visualizations"])
  req.analytic.visualizations.push.apply(req.analytic.visualizations, updated_visualizations)
  req.analytic.save(function(err, analytic) {
    if(err){ return next(err); }

    res.json(analytic.visualizations);
  });
});

/* DELETE /analytics/:analytic/visualizations/:visualization */
/* Removes a visualization from an analytic but doesn't delete it */
router.delete('/:analytic/visualizations/:visualization', function(req, res, next) {  
  req.analytic.visualizations.remove(req.visualization);
  req.analytic.save(function(err, analytic) {
    if(err){ return next(err); }

    res.json(analytic.visualizations);
  });
});

/* TODO: Should we just have this route as /visualizations/:visualization? */
/* GET /analytics/:analytic/visualizations/:visualization */
/*router.get('/:analytic/visualizations/:visualization', function(req, res, next) {
  if(req.analytic.visualizations.indexOf(req.visualization._id) === -1) { 
    return next(new Error("can't find visualizations associated with analytic")); 
  }
  res.json(req.visualization);
});*/


