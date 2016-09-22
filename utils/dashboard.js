const mongoose = require('mongoose')
const DashboardGroup = mongoose.model('DashboardGroup')

exports.addDashboardToGroup = addDashboardToGroup
exports.populateFullDashboard = populateFullDashboard
exports.execPopulateFullDashboard = execPopulateFullDashboard
exports.removeDashboardFromGroup = removeDashboardFromGroup

function addDashboardToGroup (dashboardGroup, dashboard, returnFn) {
  return DashboardGroup
    .findByIdAndUpdate(
      dashboardGroup,
      {$addToSet: {'dashboards': dashboard}},
      {safe: true, upsert: true, new: true}
    )
}

function removeDashboardFromGroup (dashboardGroup, dashboard, returnFn) {
  return DashboardGroup
    .findByIdAndUpdate(
      dashboardGroup,
      {$pull: {'dashboards': dashboard}},
      {safe: true, upsert: true, new: true},
      returnFn
    )
}

function populateFullDashboard (dashboard) {
  return dashboard
    .populate({
      path: 'visualizations',
      populate: [
        {path: 'analytic'},
        {path: 'source'},
        {path: 'visualizationType'}
      ]
    })
}

function execPopulateFullDashboard (dashboard) {
  return populateFullDashboard(dashboard).execPopulate()
}