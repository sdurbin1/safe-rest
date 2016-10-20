const express = require('express')
const mongoose = require('mongoose')
const authentication = require('../utils/authentication')
const mongoUtils = require('../utils/mongoUtil')
const utils = require('../utils/dashboard')

const router = express.Router()
const Dashboard = mongoose.model('Dashboard')
const DashboardGroup = mongoose.model('DashboardGroup')
const Visualization = mongoose.model('Visualization')

module.exports = router

/* PRELOAD OBJECTS */

/* :dashboard param */
router.param('dashboard', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Dashboard, id, req, next, 'dashboard')
})

/* :visualization param */
router.param('visualization', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Visualization, id, req, next, 'visualization')
})

/* END PRELOADING OBJECTS */

/* GET /dashboards */
router.get('/', (req, res, next) => {
  mongoUtils.returnResults(
    utils.populateFullDashboard(Dashboard.find()), res, next
  )
})

/* GET /dashboards/simple */
router.get('/simple', (req, res, next) => {
  mongoUtils.returnResults(Dashboard.find({}, 'title _id'), res, next)
})

/* POST /dashboards */
router.post('/', authentication.roleAdmin, (req, res, next) => {
  const {group} = req.body
  const dashboard = new Dashboard(req.body)

  dashboard
    .save()
    .then(dashboard => utils.populateFullDashboard(dashboard))
    .then(dashboard => {
      dashboard = dashboard.toObject()
      dashboard.group = group
      res.json(dashboard)
      
      if (group) {
        utils.addDashboardToGroup(group, dashboard).exec()
      }
    })
    .catch(err => next(err))
})

/* GET /dashboards/:dashboard */
router.get('/:dashboard', (req, res, next) => {
  mongoUtils.returnResults(
    utils.execPopulateFullDashboard(req.dashboard), res, next
  )
})

/* PUT /dashboards/:dashboard */
router.put('/:dashboard', authentication.roleAdmin, (req, res, next) => {
  const {group} = req.body
  const {dashboard: dashboardId} = req.params

  utils
    .populateFullDashboard(
      Dashboard
        .findOneAndUpdate({'_id': req.dashboard._id}, req.body, {new: true})
    )
    .then(dashboard => {
      dashboard = dashboard.toObject()
      dashboard.group = group
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
router.delete('/:dashboard', authentication.roleAdmin, (req, res, next) => {
  mongoUtils.removeModelObject(Dashboard, req.dashboard._id, res, next)
})

/* GET /dashboards/:dashboard/visualizations */
router.get('/:dashboard/visualizations', (req, res, next) => {
  populateVisualizations(utils.execPopulateFullDashboard(req.dashboard), res, next)
})

/* PUT /dashboards/:dashboard/group/:group */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/dashboard-groups/:dashboardGroup', authentication.roleAdmin, (req, res, next) => {
  mongoUtils.returnResults(
    DashboardGroup
      .findByIdAndUpdate(
        req.params.dashboardGroup,
        {$addToSet: {dashboards: {$in: [req.dashboard]}}},
        {safe: true, upsert: true, new: true}),
    res,
    next
  )
})

/* GET /dashboards/:dashboard/visualizations/simple */
router.get('/:dashboard/visualizations/simple', (req, res, next) => {
  populateVisualizations(
    req.dashboard
      .populate('visualizations', {'name': 1})
      .execPopulate(),
    res,
    next
  )
})

/* PUT /dashboards/:dashboard/visualizations */
/* Add an existing visualization to a dashboard */
router.put('/:dashboard/visualizations', authentication.roleAdmin, (req, res, next) => {
  // first doing concat as req.body["visualizations"] is not an array if only one element passed in
  const updatedVisualizations = [].concat(req.body['visualizations'])
  
  req.dashboard.visualizations.push.apply(req.dashboard.visualizations, updatedVisualizations)
  populateVisualizations(
    req.dashboard
      .save()
      .then(dashboard => utils.execPopulateFullDashboard(req.dashboard)),
    res,
    next
  )
})

/* DELETE /dashboards/:dashboard/visualizations/:visualization */
/* Removes a visualization from a dashboard but doesn't delete it */
router.delete('/:dashboard/visualizations/:visualization', authentication.roleAdmin, (req, res, next) => {
  req.dashboard.visualizations.remove(req.visualization)
  populateVisualizations(
    req.dashboard
      .save()
      .then(dashboard => utils.execPopulateFullDashboard(req.dashboard)),
    res,
    next
  )
})

const populateVisualizations = (query, res, next) => (
  query
    .then(dashboard => { res.json(dashboard.visualizations) })
    .catch(err => next(err))
)
