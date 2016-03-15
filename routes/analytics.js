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

/* :parameter param */
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
  //res.json(req.analytic);
  
  req.analytic.populate(['visualizations','analyticParams'], function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic);
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

/* TODO: Should we just have this route as /params/:param? */
/* GET /analytics/:analytic/params/:param */
router.get('/:analytic/params/:param', function(req, res, next) {
  if(req.analytic.analyticParams.indexOf(req.analyticParam._id) === -1) { 
    return next(new Error("can't find analyticParam associated with analytic")); 
  }
  res.json(req.analyticParam);
});


/* POST /analytics/:analytic/visualizations */
router.post('/:analytic/visualizations', function(req, res, next) {
  var visualization = new Visualization(req.body);
  visualization.analytic = req.analytic;

  visualization.save(function(err, visualization){
    if(err){ return next(err); }

    req.analytic.visualizations.push(visualization);
    req.analytic.save(function(err, analytic) {
      if(err){ return next(err); }

      res.json(visualization);
    });
  });
});

/* GET /analytics/:analytic/visualizations */
router.get('/:analytic/visualizations', function(req, res, next) {
  req.analytic.populate('visualizations', function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic.visualizations);
  });
});

/* TODO: Should we just have this route as /visualizations/:visualization? */
/* GET /analytics/:analytic/visualizations/:visualization */
router.get('/:analytic/visualizations/:visualization', function(req, res, next) {
  if(req.analytic.visualizations.indexOf(req.visualization._id) === -1) { 
    return next(new Error("can't find visualizations associated with analytic")); 
  }
  res.json(req.visualization);
});


