var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Chart = mongoose.model('Chart');

/************** PRELOAD OBJECTS ******************/

/* :chart param */
router.param('chart', function(req, res, next, id) {
  var query = Chart.findById(id);

  query.exec(function (err, chart){
    if (err) { return next(err); }
    if (!chart) { return next(new Error('can\'t find chart')); }

    req.chart = chart;
    return next();
  });
});

/********** END PRELOADING OBJECTS ***********/

/* GET /charts */
router.get('/', function(req, res, next) {
  Chart.find(function(err, charts){
    if(err){ return next(err); }

    res.json(charts);
  });
});

/* POST /charts */
router.post('/', function(req, res, next) {
  var chart = new Chart(req.body);

  chart.save(function(err, chart){
    if(err){ return next(err); }

    res.json(chart);
  });
});

/* GET /charts/:chart */
router.get('/:chart', function(req, res, next) {
  res.json(req.chart);
});

/* PUT /charts/:chart */
router.put('/:chart', function(req, res, next) {
  Chart.findOneAndUpdate({ "_id": req.chart._id }, req.body, {new: true}, function(err, chart) {
    if (err){ return next(err); };

    res.json(chart);
  });
});

/* DELETE /charts/:chart */
router.delete('/:chart', function(req, res, next) {
  Chart.find({ "_id": req.chart._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});