var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Dashboard = mongoose.model('Dashboard');
var Chart = mongoose.model('Chart');

/************** PRELOAD OBJECTS ******************/

/* :dashboard param */
router.param('dashboard', function(req, res, next, id) {
  var query = Dashboard.findById(id);

  query.exec(function (err, dashboard){
    if (err) { return next(err); }
    if (!dashboard) { return next(new Error('can\'t find dashboard')); }

    req.dashboard = dashboard;
    return next();
  });
});

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

/* GET /dashboards */
router.get('/', function(req, res, next) {
  Dashboard.find(function(err, dashboards){
    if(err){ return next(err); }

    res.json(dashboards);
  });
});

/* POST /dashboards */
router.post('/', function(req, res, next) {
  var dashboard = new Dashboard(req.body);

  dashboard.save(function(err, dashboard){
    if(err){ return next(err); }

    res.json(dashboard);
  });
});

/* GET /dashboards/:dashboard */
router.get('/:dashboard', function(req, res, next) {
  res.json(req.dashboard);
});

/* PUT /dashboards/:dashboard */
router.put('/:dashboard', function(req, res, next) {
  Dashboard.findOneAndUpdate({ "_id": req.dashboard._id }, req.body, {new: true}, function(err, dashboard) {
    if (err){ return next(err); };

    res.json(dashboard);
  });
});

/* DELETE /dashboards/:dashboard */
router.delete('/:dashboard', function(req, res, next) {
  Dashboard.find({ "_id": req.dashboard._id }).remove( function(err) {
    if(err){ return next(err); };
  
    res.json({});
  });
});

/* GET /dashboards/:dashboard/charts */
router.get('/:dashboard/charts', function(req, res, next) {
  req.dashboard.populate('charts', function(err, dashboard) {
    if (err) { return next(err); }

    res.json(dashboard.charts);
  });
});

/* PUT /dashboards/:dashboard/charts */
/* Add an existing chart to a dashboard */
router.put('/:dashboard/charts', function(req, res, next) {  
  //first doing concat as req.body["charts"] is not an array if only one element passed in
  var updated_charts = [].concat(req.body["charts"])
  req.dashboard.charts.push.apply(req.dashboard.charts, updated_charts)
  req.dashboard.save(function(err, dashboard) {
    if(err){ return next(err); }

    res.json(dashboard.charts);
  });
});

/* DELETE /dashboards/:dashboard/charts/:chart */
/* Removes a chart from a dashboard but doesn't delete it */
router.delete('/:dashboard/charts/:chart', function(req, res, next) {  
  req.dashboard.charts.remove(req.chart);
  req.dashboard.save(function(err, dashboard) {
    if(err){ return next(err); }

    res.json(dashboard.charts);
  });
});