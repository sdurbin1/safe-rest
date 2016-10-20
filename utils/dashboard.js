const mongoose = require('mongoose')
const DashboardGroup = mongoose.model('DashboardGroup')

exports.addDashboardToGroup = (dashboardGroup, dashboard, returnFn) => {
  return DashboardGroup
    .findByIdAndUpdate(
      dashboardGroup,
      {$addToSet: {'dashboards': dashboard}},
      {safe: true, upsert: true, new: true}
    )
}

exports.removeDashboardFromGroup = (dashboardGroup, dashboard, returnFn) => {
  return DashboardGroup
    .findByIdAndUpdate(
      dashboardGroup,
      {$pull: {'dashboards': dashboard}},
      {safe: true, upsert: true, new: true},
      returnFn
    )
}

const populateFullDashboard = exports.addDashboardToGroup = dashboard => {
  return dashboard.populate({
    path: 'visualizations',
    populate: [
      {path: 'analytic'},
      {path: 'source'},
      {path: 'visualizationType'}
    ]
  })
}

exports.execPopulateFullDashboard = dashboard => {
  return populateFullDashboard(dashboard).execPopulate()
}