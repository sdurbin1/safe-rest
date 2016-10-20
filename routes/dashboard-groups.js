const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')
const utils = require('../utils/dashboard')

const router = express.Router()
const Dashboard = mongoose.model('Dashboard')
const DashboardGroup = mongoose.model('DashboardGroup')

module.exports = router

/* PRELOAD OBJECTS */

/* :dashboard param */
router.param('dashboard', (req, res, next, id) => {
  mongoUtils.populateRouterParam(Dashboard, id, req, next, 'dashboard')
})

/* :dashboard-group param */
router.param('dashboardGroup', (req, res, next, id) => {
  mongoUtils.populateRouterParam(DashboardGroup, id, req, next, 'dashboardGroup')
})

/* END PRELOADING OBJECTS */

/* GET /dashboard-groups */
router.get('/', (req, res, next) => {
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
router.post('/', (req, res, next) => {
  const dashboardGroup = new DashboardGroup(req.body)

  mongoUtils.returnResults(dashboardGroup.save(), res, next)
})

/* GET /dashboard-groups/:dashboardGroup */
router.get('/:dashboardGroup', (req, res, next) => {
  res.json(req.dashboardGroup)
})

/* PUT /dashboard-groups/:dashboardGroup */
router.put('/:dashboardGroup', (req, res, next) => {
  mongoUtils.returnResults(
    DashboardGroup.findOneAndUpdate({'_id': req.dashboardGroup._id}, req.body, {new: true}),
    res,
    next
  )
})

/* DELETE /dashboard-groups/:dashboardGroup */
router.delete('/:dashboardGroup', (req, res, next) => {
  mongoUtils.removeModelObject(DashboardGroup, req.dashboardGroup._id, res, next)
})

/* GET /dashboard-groups/:dashboardGroup/dashboards */
router.get('/:dashboardGroup/dashboards', (req, res, next) => {
  res.json(req.dashboardGroup.dashboards)
})

/* PUT /dashboard-groups/:dashboardGroup/dashboard/:dashboard */
/* Add an existing dashboard to a dashboard group */
router.put('/:dashboardGroup/dashboards/:dashboard', (req, res, next) => {
  mongoUtils.returnResults(
    utils.addDashboardToGroup(req.params.dashboardGroup, req.dashboard), res, next
  )
})

/* DELETE /dashboard-groups/:dashboardGroup/dashboard/:dashboard */
/* Add an existing dashboard to a dashboard group */
router.delete('/:dashboardGroup/dashboards/:dashboard', (req, res, next) => {
  mongoUtils.returnResults(
    utils.removeDashboardFromGroup(req.params.dashboardGroup, req.param.dashboard),
    res,
    next
  )
})