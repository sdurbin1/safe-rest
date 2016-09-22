const mongoUtils = require('../utils/mongoUtil')
const utils = require('../utils/dashboard')
const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

const Dashboard = mongoose.model('Dashboard')
const DashboardGroup = mongoose.model('DashboardGroup')

/* PRELOAD OBJECTS */

/* :dashboard param */
router.param('dashboard', function (req, res, next, id) {
  mongoUtils.populateRouterParam(Dashboard, id, req, next, 'dashboard')
})

/* :dashboard-group param */
router.param('dashboardGroup', function (req, res, next, id) {
  mongoUtils.populateRouterParam(DashboardGroup, id, req, next, 'dashboardGroup')
})

/* END PRELOADING OBJECTS */

/* GET /dashboard-groups */
router.get('/', function (req, res, next) {
  DashboardGroup
    .find()
    .populate({
      path: 'dashboards',
      populate:
      {
        path: 'visualizations',
        model: 'Visualization',
        populate: [
          {path: 'analytic', model: 'Analytic'},
          {path: 'source', model: 'Source'},
          {path: 'visualizationType', model: 'VisualizationType'}
        ]
      }
    })
    .lean()
    .then(dashboardGroups => (
      dashboardGroups.map(dashboardGroup => {
        const {dashboards = [], _id: groupId} = dashboardGroup
        
        for (const dashboard of dashboards) {
          dashboard.group = groupId
        }

        return dashboardGroup
      })
    ))
    .then(dashboardGroups => { res.json(dashboardGroups) })
    .catch(err => next(err))
})

/* POST /dashboard-groups */
router.post('/', function (req, res, next) {
  const dashboardGroup = new DashboardGroup(req.body)

  dashboardGroup
    .save()
    .then(dashboardGroup => { res.json(dashboardGroup) })
    .catch(err => next(err))
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
  DashboardGroup
    .find({'_id': req.dashboardGroup._id})
    .remove()
    .then(dashboardGroups => { res.json({}) })
    .catch(err => next(err))
})

/* GET /dashboard-groups/:dashboardGroup/dashboards */
router.get('/:dashboardGroup/dashboards', function (req, res, next) {
  res.json(req.dashboardGroup.dashboards)
})

/* PUT /dashboard-groups/:dashboardGroup/dashboard/:dashboard */
/* Add an existing dashboard to a dashboard group */
router.put('/:dashboardGroup/dashboards/:dashboard', function (req, res, next) {
  utils
    .addDashboardToGroup(req.params.dashboardGroup, req.dashboard)
    .then(dashboardGroup => { res.json(dashboardGroup) })
    .catch(err => next(err))
})

/* DELETE /dashboard-groups/:dashboardGroup/dashboard/:dashboard */
/* Add an existing dashboard to a dashboard group */
router.delete('/:dashboardGroup/dashboards/:dashboard', function (req, res, next) {
  utils
    .removeDashboardFromGroup(req.params.dashboardGroup, req.param.dashboard)
    .then(dashboardGroup => { res.json(dashboardGroup) })
    .catch(err => next(err))
})