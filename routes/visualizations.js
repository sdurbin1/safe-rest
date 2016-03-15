var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Visualization = mongoose.model('Visualization');
var VisualizationParam = mongoose.model('VisualizationParam');

/******** PRELOADING OBJECTS *************/

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

/* :param param */
router.param('param', function(req, res, next, id) {
  var query = VisualizationParam.findById(id);

  query.exec(function (err, visualizationParam){
    if (err) { return next(err); }
    if (!visualizationParam) { return next(new Error('can\'t find visualization param')); }

    req.visualizationParam = visualizationParam;
    return next();
  });
});

/******** END PRELOADING OBJECTS *********/

/* GET /visualizations */
router.get('/', function(req, res, next) {
  Visualization.find(function(err, visualizations){
    if(err){ return next(err); }

    res.json(visualizations);
  });
});

/* POST /visualizations */
/*router.post('/', function(req, res, next) {
  var visualization = new Parameter(req.body);

  parameter.save(function(err, visualization){
    if(err){ return next(err); }

    res.json(visualization);
  });
});*/

/* GET /visualizations/:visualization */
router.get('/:visualization', function(req, res, next) {
  //res.json(req.visualization);
 
   req.visualization.populate('visualizationParams', function(err, visualization) {
    if (err) { return next(err); }

    res.json(visualization.visualizationParams);
  });
});

/* POST /visualizations/:visualization/params */
router.post('/:visualization/params', function(req, res, next) {
  var visualizationParam = new VisualizationParam(req.body);
  visualizationParam.analytic = req.analytic;

  visualizationParam.save(function(err, visualizationParam){
    if(err){ return next(err); }

    req.visualization.visualizationParams.push(visualizationParam);
    req.visualization.save(function(err, visualization) {
      if(err){ return next(err); }

      res.json(visualizationParam);
    });
  });
});

/* GET /visualizations/:visualization/params */
router.get('/:visualization/params', function(req, res, next) {
  req.visualization.populate('visualizationParams', function(err, visualization) {
    if (err) { return next(err); }

    res.json(visualization.visualizationParams);
  });
});

