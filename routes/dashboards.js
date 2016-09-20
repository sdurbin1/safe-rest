const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')
const Dashboard = mongoose.model('Dashboard')
const Visualization = mongoose.model('Visualization')

/* PRELOAD OBJECTS */

/* :dashboard param */
router.param('dashboard', function (req, res, next, id) {
  const query = Dashboard.findById(id)

  query.exec(function (err, dashboard) {
    if (err) { return next(err) }
    if (!dashboard) { return next(new Error('can\'t find dashboard')) }

    req.dashboard = dashboard
    
    return next()
  })
})

/* :visualization param */
router.param('visualization', function (req, res, next, id) {
  const query = Visualization.findById(id)

  query.exec(function (err, visualization) {
    if (err) { return next(err) }
    if (!visualization) { return next(new Error('can\'t find visualization')) }

    req.visualization = visualization
    
    return next()
  })
})

/* END PRELOADING OBJECTS */

const roleAdmin = function (req, res, next) {
  if (req.session.admin || process.env.NODE_ENV === 'test') {
    return next()
  } else {
    console.log('Error: must be admin to perform this action')
    return next(new Error('Error: must be admin to perform this action'))
  }
}

/* GET /dashboards */
router.get('/', function (req, res, next) {
  Dashboard.find().populate({
    path: 'visualizations',
    populate: [
      {path: 'analytic'},
      {path: 'source'},
      {path: 'visualizationType'}
    ]
  }).exec(function (err, dashboards) {
    if (err) { return next(err) }

    res.json(dashboards)
  })
})

/* GET /dashboards/simple */
router.get('/simple', function (req, res, next) {
  Dashboard.find({}, 'title _id', function (err, dashboards) {
    if (err) { return next(err) }

    res.json(dashboards)
  })
})

/* POST /dashboards */
router.post('/', roleAdmin, function (req, res, next) {
  const dashboard = new Dashboard(req.body)

  dashboard.save(function (err, dashboard) {
    if (err) { return next(err) }
    
    dashboard.populate({
      path: 'visualizations',
      populate: [
        {path: 'analytic'},
        {path: 'source'},
        {path: 'visualizationType'}
      ]
    }, function (err, dashboard) {
      if (err) { return next(err) }
      
      res.json(dashboard)
    })
  })
})

/* GET /dashboards/:dashboard */
router.get('/:dashboard', function (req, res, next) {
  req.dashboard.populate({
    path: 'visualizations',
    populate: [
      {path: 'analytic'},
      {path: 'source'},
      {path: 'visualizationType'}
    ]
  }, function (err, dashboard) {
    if (err) { return next(err) }
    
    res.json(dashboard)
  })
})

/* PUT /dashboards/:dashboard */
router.put('/:dashboard', roleAdmin, function (req, res, next) {
  Dashboard.findOneAndUpdate({'_id': req.dashboard._id}, req.body, {new: true}, function (err, dashboard) {
    if (err) { return next(err) }

    dashboard.populate({
      path: 'visualizations',
      populate: [
        {path: 'analytic'},
        {path: 'source'},
        {path: 'visualizationType'}
      ]
    }, function (err, dashboard) {
      if (err) { return next(err) }
      
      res.json(dashboard)
    })
  })
})

/* DELETE /dashboards/:dashboard */
router.delete('/:dashboard', roleAdmin, function (req, res, next) {
  Dashboard.find({'_id': req.dashboard._id}).remove(function (err) {
    if (err) { return next(err) }
  
    res.json({})
  })
})

/* GET /dashboards/:dashboard/visualizations */
router.get('/:dashboard/visualizations', function (req, res, next) {
  req.dashboard.populate({
    path: 'visualizations',
    populate: [
      {path: 'analytic'},
      {path: 'source'},
      {path: 'visualizationType'}
    ]
  }, function (err, dashboard) {
    if (err) { return next(err) }

    res.json(dashboard.visualizations)
  })
})

/* GET /dashboards/:dashboard/visualizations/simple */
router.get('/:dashboard/visualizations/simple', function (req, res, next) {
  req.dashboard.populate('visualizations', {'name': 1}, function (err, dashboard) {
    if (err) { return next(err) }

    res.json(dashboard.visualizations)
  })
})

/* PUT /dashboards/:dashboard/visualizations */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/visualizations', roleAdmin, function (req, res, next) {
  // first doing concat as req.body["visualizations"] is not an array if only one element passed in
  const updatedVisualizations = [].concat(req.body['visualizations'])
  
  req.dashboard.visualizations.push.apply(req.dashboard.visualizations, updatedVisualizations)
  req.dashboard.save(function (err, dashboard) {
    if (err) { return next(err) }
    
    dashboard.populate({
      path: 'visualizations',
      populate: [
        {path: 'analytic'},
        {path: 'source'},
        {path: 'visualizationType'}
      ]
    }, function (err, dashboard) {
      if (err) { return next(err) }

      res.json(dashboard.visualizations)
    })
  })
})

/* DELETE /dashboards/:dashboard/visualizations/:visualization */
/* Removes a visualization from a dashboard but doesn't delete it */
router.delete('/:dashboard/visualizations/:visualization', roleAdmin, function (req, res, next) {
  req.dashboard.visualizations.remove(req.visualization)
  req.dashboard.save(function (err, dashboard) {
    if (err) { return next(err) }

    dashboard.populate({
      path: 'visualizations',
      populate: [
        {path: 'analytic'},
        {path: 'source'},
        {path: 'visualizationType'}
      ]
    }, function (err, dashboard) {
      if (err) { return next(err) }

      res.json(dashboard.visualizations)
    })
  })
})
