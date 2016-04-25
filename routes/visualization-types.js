var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var VisualizationType = mongoose.model('VisualizationType');

/******** PRELOADING OBJECTS *************/

/* :visualization-type param */
router.param('visualizationType', function(req, res, next, id) {
  var query = VisualizationType.findById(id);

  query.exec(function (err, visualizationType){
    if (err) { return next(err); }
    if (!visualizationType) { return next(new Error('can\'t find visualization type')); }

    req.visualizationType = visualizationType;
    return next();
  });
});

/******** END PRELOADING OBJECTS *********/

/* GET /visualization-types */
router.get('/', function(req, res, next) {
  VisualizationType.find(function(err, visualizationTypes){
    if(err){ return next(err); }

    res.json(visualizationTypes);
  });
});

/* POST /visualization-types */
router.post('/', function(req, res, next) {
  var visualizationType = new VisualizationType(req.body);

  visualizationType.save(function(err, visualizationType){
    if(err){ return next(err); }

    res.json(visualizationType);
  });
});

/* GET /visualization-types/:visualizationType */
router.get('/:visualizationType', function(req, res, next) {
  res.json(req.visualizationType);
 
   /*req.visualization.populate('visualizationParams', function(err, visualization) {
    if (err) { return next(err); }

    res.json(visualization.visualizationParams);
  });*/
});

/* PUT /visualization-types/:visualizationType */
router.put('/:visualizationType', function(req, res, next) {
  VisualizationType.findOneAndUpdate({ "_id": req.visualizationType._id }, req.body, {new: true}, function(err, visualizationType) {
    if (err){ return next(err); };

    res.json(visualizationType);
  });
});

/* DELETE /visualization-types/:visualizationType */
router.delete('/:visualizationType', function(req, res, next) {
  VisualizationType.find({ "_id": req.visualizationType._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});
