var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Visualization = mongoose.model('Visualization');

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
router.get('/:visualization', function(req, res) {
  res.json(req.visualization);
});
