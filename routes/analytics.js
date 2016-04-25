var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Analytic = mongoose.model('Analytic');
var AnalyticParam = mongoose.model('AnalyticParam');
var VisualizationType = mongoose.model('VisualizationType');

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

/* :visualizationType param */
router.param('visualizationType', function(req, res, next, id) {
  var query = VisualizationType.findById(id);

  query.exec(function (err, visualizationType){
    if (err) { return next(err); }
    if (!visualizationType) { return next(new Error('can\'t find visualization-type')); }

    req.visualizationType = visualizationType;
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
  res.json(req.analytic);
  /*req.analytic.populate(['visualizations','analyticParams'], function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic);
  });*/
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
  req.analytic.analyticParams.remove(req.analyticParam);
  req.analytic.save(function(err, analytic) {
    if(err){ return next(err); }

    return;
  });
  
  AnalyticParam.find({ "_id": req.analyticParam._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});


/* GET /analytics/:analytic/visualization_types */
router.get('/:analytic/visualization-types', function(req, res, next) {
  req.analytic.populate('visualization-types', function(err, analytic) {
    if (err) { return next(err); }

    res.json(analytic.visualizationTypes);
  });
});

/* PUT /analytics/:analytic/visualization_types */
/* Adds an existing visualizationType to an analytic */
router.put('/:analytic/visualization-types', function(req, res, next) {  
  //first doing concat as req.body["visualizaitonTypes"] is not an array if only one element passed in
  var updatedVisualizationTypes = [].concat(req.body['visualizationTypes'])
  req.analytic.visualizationTypes.push.apply(req.analytic.visualizationTypes, updatedVisualizationTypes)
  req.analytic.save(function(err, analytic) {
    if(err){ return next(err); }

    res.json(analytic.visualizationTypes);
  });
});

/* DELETE /analytics/:analytic/visualization-types/:visualizationType */
/* Removes a visualization from an analytic but doesn't delete it */
router.delete('/:analytic/visualization-types/:visualizationType', function(req, res, next) {  
  req.analytic.visualizationTypes.remove(req.visualizationType);
  req.analytic.save(function(err, analytic) {
    if(err){ return next(err); }

    res.json(analytic.visualizationTypes);
  });
});


