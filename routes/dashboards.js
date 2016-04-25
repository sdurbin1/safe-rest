var express = require('express');
var router = express.Router();

module.exports = router;

var mongoose = require('mongoose');
var Dashboard = mongoose.model('Dashboard');
var Visualization = mongoose.model('Visualization');

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

/* GET /dashboards/:dashboard/visualizations */
router.get('/:dashboard/visualizations', function(req, res, next) {
  req.dashboard.populate('visualizations', function(err, dashboard) {
    if (err) { return next(err); }

    res.json(dashboard.visualizations);
  });
});

/* PUT /dashboards/:dashboard/visualizations */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/visualizations', function(req, res, next) {  
  //first doing concat as req.body["visualizations"] is not an array if only one element passed in
  var updatedVisualizations = [].concat(req.body['visualizations'])
  req.dashboard.visualizations.push.apply(req.dashboard.visualizations, updatedVisualizations)
  req.dashboard.save(function(err, dashboard) {
    if(err){ return next(err); }

    res.json(dashboard.visualizations);
  });
});

/* DELETE /dashboards/:dashboard/visualizations/:visualization */
/* Removes a visualization from a dashboard but doesn't delete it */
router.delete('/:dashboard/visualizations/:visualization', function(req, res, next) {  
  req.dashboard.visualizations.remove(req.visualization);
  req.dashboard.save(function(err, dashboard) {
    if(err){ return next(err); }

    res.json(dashboard.visualizations);
  });
});