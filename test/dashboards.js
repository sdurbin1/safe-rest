const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Dashboards')
require('../models/Visualizations')
const Dashboard = mongoose.model('Dashboard')
const Visualization = mongoose.model('Visualization')
const server = require('../app')
let cannedDashboard
let cannedVisualization

process.env.NODE_ENV = 'test'

describe('CRUD for dashboards', function () {
  beforeEach(function (done) {
    const dashboardJson = {'title': 'dashboard', 'subtitle': 'subtitle', 'dashboardParams': {'size': 2, 'visualizationSizes': {1: 2, 2: 2}}}

    Dashboard.create(dashboardJson, function (err, dashboard) {
      if (err) { throw err }
      cannedDashboard = dashboard
      
      Visualization.create({'name': 'visualization'}, function (err, visualization) {
        if (err) { throw err }
        
        server.start
        cannedVisualization = visualization
      
        done()
      })
    })
  })
  
  afterEach(function (done) {
    Dashboard.remove({}, function (err) {
      if (err) { throw err }
      
      Visualization.remove({}, function (err) {
        if (err) { throw err }
        server.stop
      
        done()
      })
    })
  })
  
  it('POST /dashboards', function testPostDashboards (done) {
    request(server)
      .post('/dashboards')
      .send({'title': 'dashboard1', 'subtitle': 'subtitle', 'dashboardParams': {'size': 2, 'visualizationSizes': {1: 2, 2: 2}}})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'title': 'dashboard1',
        'subtitle': 'subtitle',
        'visualizations': [],
        'dashboardParams': {
          'size': 2,
          'visualizationSizes': {1: 2, 2: 2}
        },
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /dashboards', function testGetDashboards (done) {
    request(server)
      .get('/dashboards')
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedDashboard._id.toString(),
        'title': 'dashboard',
        'subtitle': 'subtitle',
        'dashboardParams': {
          'size': 2,
          'visualizationSizes': {1: 2, 2: 2}
        },
        'visualizations': [],
        '__v': 0
      }], done)
  })
  
  it('GET /dashboards/:dashboard', function testGetDashboard (done) {
    request(server)
      .get('/dashboards/' + cannedDashboard._id)
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboard._id.toString(),
        'title': 'dashboard',
        'subtitle': 'subtitle',
        'dashboardParams': {
          'size': 2,
          'visualizationSizes': {1: 2, 2: 2}
        },
        'visualizations': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /dashboards/:dashboard', function testPutDashboard (done) {
    request(server)
      .put('/dashboards/' + cannedDashboard._id)
      .send({'title': 'dashboard1'})
      .expect(function (res) {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboard._id.toString(),
        'title': 'dashboard1',
        'subtitle': 'subtitle',
        'dashboardParams': {
          'size': 2,
          'visualizationSizes': {1: 2, 2: 2}
        },
        'visualizations': [],
        '__v': 0
      }, done)
  })
  
  it('DELETE /dashboards/:dashboard', function testDeleteDashboard (done) {
    request(server)
      .delete('/dashboards/' + cannedDashboard._id)
      .expect(200, {}, done)
  })
 
  it('PUT /dashboards/:dashboard/visualizations', function testPutVisualization (done) {
    request(server)
      .put('/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .expect(function (res) {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualization._id.toString(),
        '__v': 0,
        'name': 'visualization'
      }], done)
  })
  
  it('GET /dashboards/:dashboard/visualizations', function testGetVisualization (done) {
    request(server)
      .put('/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .end(function () {
        request(server)
          .get('/dashboards/' + cannedDashboard._id + '/visualizations')
          .expect(function (res) {
            res.body[0].__v = 0
          })
          .expect(200, [{
            '_id': cannedVisualization._id.toString(),
            '__v': 0,
            'name': 'visualization'
          }], done)
      })
  })
  
  it('DELETE /dashboards/:dashboard/visualizations/:visualization', function testDeleteVisualization (done) {
    // First add visualization-type to analytic so we can test deleting it
    request(server)
      .put('/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .end(function () {
        // Test delete
        request(server)
          .delete('/dashboards/' + cannedDashboard._id + '/visualizations/' + cannedVisualization._id)
          .expect(200, [], done)
      })
  })
})
