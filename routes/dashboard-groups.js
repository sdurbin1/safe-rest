const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')
const Dashboard = mongoose.model('Dashboard')
const DashboardGroup = mongoose.model('DashboardGroup')

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

/* :dashboard-group param */
router.param('dashboardGroup', function (req, res, next, id) {
  const query = DashboardGroup.findById(id)

  query.exec(function (err, dashboardGroup) {
    if (err) { return next(err) }
    if (!dashboardGroup) { return next(new Error('can\'t find dashboard-group')) }

    req.dashboardGroup = dashboardGroup
    
    return next()
  })
})

/* END PRELOADING OBJECTS */

/* GET /dashboard-groups */
router.get('/', function (req, res, next) {
  DashboardGroup.find(function (err, dashboardGroups) {
    if (err) { return next(err) }

    res.json(dashboardGroups)
  })
})

/* POST /dashboard-groups */
router.post('/', function (req, res, next) {
  const dashboardGroup = new DashboardGroup(req.body)

  dashboardGroup.save(function (err, dashboardGroup) {
    if (err) { return next(err) }

    res.json(dashboardGroup)
  })
})

/* GET /dashboard-groups/:dashboardGroup */
router.get('/:dashboardGroup', function (req, res, next) {
  res.json(req.dashboardGroup)
})

/* PUT /dashboard-groups/:dashboardGroup */
router.put('/:dashboardGroup', function (req, res, next) {
  DashboardGroup.findOneAndUpdate({'_id': req.dashboardGroup._id}, req.body, {new: true}, function (err, dashboardGroup) {
    if (err) { return next(err) }

    res.json(dashboardGroup)
  })
})

/* DELETE /dashboard-groups/:dashboardGroup */
router.delete('/:dashboardGroup', function (req, res, next) {
  DashboardGroup.find({'_id': req.dashboardGroup._id}).remove(function (err) {
    if (err) { return next(err) }
  
    res.json({})
  })
})

/* GET /dashboard-groups/:dashboardGroup/visualizations */
router.get('/:dashboardGroup/dashboards', function (req, res, next) {
  res.json(req.dashboardGroup.dashboards)
})