var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Visualization = mongoose.model('Visualization');
var VisualizationType = mongoose.model('VisualizationType');

/************** PRELOAD OBJECTS ******************/

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

/* :visualization-type param */
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

/* GET /visualizations */
router.get('/', function(req, res, next) {
  Visualization.find().populate(['visualizationType', 'analytic', 'source']).exec( function(err, visualizations){
    if(err){ return next(err); }

    res.json(visualizations);
  });
});

/* POST /visualizations */
router.post('/', function(req, res, next) {
  var visualization = new Visualization(req.body);

  visualization.save(function(err, visualization){
    if(err){ return next(err); }

    visualization.populate(['visualizationType', 'analytic', 'source'], function(err, visualization) {
      if(err){ return next(err); } 
      
      res.json(visualization);
    });
  });
});

/* GET /visualizations/:visualization */
router.get('/:visualization', function(req, res, next) {
  req.visualization.populate(['visualizationType', 'analytic', 'source'], function(err, visualization) {
    if (err) { return next(err); }

    res.json(visualization);
  });
});

/* PUT /visualizations/:visualization */
router.put('/:visualization', function(req, res, next) {
  Visualization.findOneAndUpdate({ "_id": req.visualization._id }, req.body, {new: true}, function(err, visualization) {
    if (err){ return next(err); };

    visualization.populate(['visualizationType', 'analytic', 'source'], function(err, visualization) {
      if(err){ return next(err); } 
      
      res.json(visualization);
    });
  });
});

/* DELETE /visualizations/:visualization */
router.delete('/:visualization', function(req, res, next) {
  Visualization.find({ "_id": req.visualization._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});