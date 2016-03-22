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
router.post('/', function(req, res, next) {
  var visualization = new Visualization(req.body);

  visualization.save(function(err, visualization){
    if(err){ return next(err); }

    res.json(visualization);
  });
});

/* GET /visualizations/:visualization */
router.get('/:visualization', function(req, res, next) {
  res.json(req.visualization);
 
   /*req.visualization.populate('visualizationParams', function(err, visualization) {
    if (err) { return next(err); }

    res.json(visualization.visualizationParams);
  });*/
});

/* PUT /visualizations/:visualization */
router.put('/:visualization', function(req, res, next) {
  Visualization.findOneAndUpdate({ "_id": req.visualization._id }, req.body, {new: true}, function(err, visualization) {
    if (err){ return next(err); };

    res.json(visualization);
  });
});

/* DELETE /visualizations/:visualization */
router.delete('/:visualization', function(req, res, next) {
  Visualization.find({ "_id": req.visualization._id }).remove( function(err) {
    if(err){ return next(err); };

    /* Remove associated visualizationParams */
    VisualizationParam.find({ visualization : req.visualization._id }).remove().exec();
  
    res.json({});
  });
});

/* POST /visualizations/:visualization/params */
router.post('/:visualization/params', function(req, res, next) {
  var visualizationParam = new VisualizationParam(req.body);
  visualizationParam.visualization = req.visualization;

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

/* DELETE /visualizations/:visualization/params/:param */
router.delete('/:visualization/params/:param', function(req, res, next) {
  req.visualization.visualizationParams.remove(req.visuzliationParam);
  req.visualization.save(function(err, visualization) {
    if(err){ return next(err); }

    return;
  });
  
  VisualizationParam.find({ "_id": req.visualizationParam._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});
