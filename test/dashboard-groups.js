const request = require('supertest')
const mongoose = require('mongoose')

require('../models/DashboardGroups')
require('../models/Dashboards')
const DashboardGroup = mongoose.model('DashboardGroup')
const Dashboard = mongoose.model('Dashboard')
const server = require('../app')
let cannedDashboardGroup
let cannedDashboard

process.env.NODE_ENV = 'test'

describe('CRUD for dashboardGroups', function () {
  beforeEach(function (done) {
    DashboardGroup.create({'title': 'group'}, function (err, dashboardGroup) {
      if (err) { throw err }
      
      const dashboardJson = {'title': 'dashboard', 'subtitle': 'subtitle', 'dashboardParams': {'size': 2, 'visualizationSizes': {1: 2, 2: 2}}}
      
      cannedDashboardGroup = dashboardGroup
      
      Dashboard.create(dashboardJson, function (err, dashboard) {
        if (err) { throw err }
      
        server.start
        cannedDashboard = dashboard
      
        done()
      })
    })
  })
  
  afterEach(function (done) {
    DashboardGroup.remove({}, function (err) {
      if (err) { throw err }

      Dashboard.remove({}, function (err) {
        if (err) { throw err }
        server.stop
      
        done()
      })
    })
  })
  
  it('POST /dashboard-groups', function testPostDashboardGroups (done) {
    request(server)
      .post('/dashboard-groups')
      .send({'title': 'group1'})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'title': 'group1',
        'dashboards': [],
        '__v': 0,
        '_id': 1
      }, done)
  })
  
 it('GET /dashboard-groups', function testGetDashboardGroups (done) {
    request(server)
      .get('/dashboard-groups')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group',
        'dashboards': [],
        '__v': 0
      }], done)
  })
  
  it('GET /dashboard-groups/:dashboard-group', function testGetDashboardGroup (done) {
    request(server)
      .get('/dashboard-groups/' + cannedDashboardGroup._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group',
        'dashboards': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /dashboard-groups/:dashboard-group', function testPutDashboardGroup (done) {
    request(server)
      .put('/dashboard-groups/' + cannedDashboardGroup._id)
      .send({'title': 'group1'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group1',
        'dashboards': [],
        '__v': 0
      }, done)
  })
  
  it('DELETE /dashboard-groups/:dashboard-group', function testDeleteDashboardGroup (done) {
    request(server)
      .delete('/dashboard-groups/' + cannedDashboardGroup._id)
      .expect(200, {}, done)
  })
  
  it('GET /dashboard-groups/:dashboard-group/visualizations', function testGetDashboardGroupVisualizations (done) {
    request(server)
      .put('/dashboard-groups/' + cannedDashboardGroup._id)
      .send({'dashboards': [cannedDashboard._id]})
      .end(function () {
        request(server)
          .get('/dashboard-groups/' + cannedDashboardGroup._id + '/dashboards')
          .expect(function (res) {
            res.body[0].__v = 0
          })
          .expect(200, [cannedDashboard._id.toString()], done)
      })
  })
})