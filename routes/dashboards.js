const express = require('express')
const router = express.Router()

module.exports = router

const mongoose = require('mongoose')

mongoose.Promise = require('bluebird')

const Dashboard = mongoose.model('Dashboard')
const DashboardGroup = mongoose.model('DashboardGroup')
const Visualization = mongoose.model('Visualization')

const mongoUtils = require('../utils/mongoUtil')
const utils = require('../utils/dashboard')

/* PRELOAD OBJECTS */

/* :dashboard param */
router.param('dashboard', function (req, res, next, id) {
  mongoUtils.populateRouterParam(Dashboard, id, req, next, 'dashboard')
})

/* :visualization param */
router.param('visualization', function (req, res, next, id) {
  mongoUtils.populateRouterParam(Visualization, id, req, next, 'visualization')
})

/* END PRELOADING OBJECTS */

const roleAdmin = function (req, res, next) {
  if (req.session.admin || process.env.NODE_ENV === 'test') {
    return next()
  } else {
    return next(new Error('Error: must be admin to perform this action'))
  }
}

/* GET /dashboards */
router.get('/', function (req, res, next) {
  utils
    .populateFullDashboard(Dashboard.find())
    .then(dashboards => { res.json(dashboards) })
    .catch(err => next(err))
})

/* GET /dashboards/simple */
router.get('/simple', function (req, res, next) {
  Dashboard
    .find({}, 'title _id')
    .then(dashboards => { res.json(dashboards) })
    .catch(err => next(err))
})

/* POST /dashboards */
router.post('/', roleAdmin, function (req, res, next) {
  const {group} = req.body
  const dashboard = new Dashboard(req.body)

  dashboard
    .save()
    .then(dashboard => utils.populateFullDashboard(dashboard).toObject())
    .then(dashboard => {
      dashboard.group = group
      res.json(dashboard)
      
      if (group) {
        utils.addDashboardToGroup(group, dashboard).exec()
      }
    })
    .catch(err => next(err))
})

/* GET /dashboards/:dashboard */
router.get('/:dashboard', function (req, res, next) {
  utils
    .execPopulateFullDashboard(req.dashboard)
    .then(dashboard => { res.json(dashboard) })
    .catch(err => next(err))
})

/* PUT /dashboards/:dashboard */
router.put('/:dashboard', roleAdmin, function (req, res, next) {
  const {group} = req.body
  const {dashboard: dashboardId} = req.params
 
  Dashboard
    .findOneAndUpdate({'_id': req.dashboard._id}, req.body, {new: true})
    .then(dashboard => utils.execPopulateFullDashboard(dashboard))
    .then(dashboard => {
      res.json(dashboard)
      
      // Find dashboard within any of the dashboard groups.
      return DashboardGroup
        .findOne({dashboards: {$in: [dashboardId]}})
    })
    .then(existingDashbardGroup => {
      const {_id: existingGroupId} = existingDashbardGroup
      
      if (group && group !== existingGroupId) {
        // Remove pervious dashboard group and replace with new one
        if (existingDashbardGroup) {
          utils
            .removeDashboardFromGroup(existingGroupId, dashboardId).exec()
        }
        
        utils.addDashboardToGroup(group, dashboardId).exec()
      }
    })
    .catch(err => next(err))
})

/* DELETE /dashboards/:dashboard */
router.delete('/:dashboard', roleAdmin, function (req, res, next) {
  Dashboard
    .find({'_id': req.dashboard._id})
    .remove()
    .then(() => { res.json({}) })
    .catch(err => next(err))
})

/* GET /dashboards/:dashboard/visualizations */
router.get('/:dashboard/visualizations', function (req, res, next) {
  utils
    .execPopulateFullDashboard(req.dashboard)
    .then(dashboard => {
      res.json(dashboard.visualizations)
    })
    .catch(err => next(err))
})

/* PUT /dashboards/:dashboard/group/:group */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/dashboard-groups/:dashboardGroup', roleAdmin, function (req, res, next) {
  DashboardGroup
    .findByIdAndUpdate(
      req.params.dashboardGroup,
      {$addToSet: {dashboards: {$in: [req.dashboard]}}},
      {safe: true, upsert: true, new: true})
    .then(dashboardGroup => { res.json(dashboardGroup) })
    .catch(err => next(err))
})

/* GET /dashboards/:dashboard/visualizations/simple */
router.get('/:dashboard/visualizations/simple', function (req, res, next) {
  req.dashboard
    .populate('visualizations', {'name': 1})
    .then(dashboard => { res.json(dashboard.visualizations) })
    .catch(err => next(err))
})

/* PUT /dashboards/:dashboard/visualizations */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/visualizations', roleAdmin, function (req, res, next) {
  // first doing concat as req.body["visualizations"] is not an array if only one element passed in
  const updatedVisualizations = [].concat(req.body['visualizations'])
  
  req.dashboard.visualizations.push.apply(req.dashboard.visualizations, updatedVisualizations)
  req.dashboard
    .save()
    .then(dashboard => utils.execPopulateFullDashboard(req.dashboard))
    .then(dashboard => { res.json(dashboard.visualizations) })
    .catch(err => next(err))
})

/* DELETE /dashboards/:dashboard/visualizations/:visualization */
/* Removes a visualization from a dashboard but doesn't delete it */
router.delete('/:dashboard/visualizations/:visualization', roleAdmin, function (req, res, next) {
  req.dashboard.visualizations.remove(req.visualization)
  req.dashboard
    .save()
    .then(dashboard => utils.execPopulateFullDashboard(req.dashboard))
    .then(dashboard => { res.json(dashboard.visualizations) })
    .catch(err => next(err))
})