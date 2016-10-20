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

describe('CRUD for dashboards', () => {
  beforeEach(done => {
    Dashboard
      .create({
        'title': 'dashboard',
        'subtitle': 'subtitle',
        'dashboardParams': {
          'size': 2,
          'visualizationSizes': {1: 2, 2: 2}
        }
      })
      .then(dashboard => {
        cannedDashboard = dashboard
      
        return Visualization.create({'name': 'visualization'})
      })
      .then(visualization => {
        server.start
        cannedVisualization = visualization
      
        done()
      })
      .catch(err => { throw err })
  })
  
  afterEach(done => {
    Dashboard.remove({})
    .then(() => Visualization.remove({}))
    .then(() => {
      server.stop
      
      done()
    })
    .catch(err => { throw err })
  })
  
  it('POST /api/dashboards', done => {
    request(server)
      .post('/api/dashboards')
      .send({'title': 'dashboard1', 'subtitle': 'subtitle', 'dashboardParams': {'size': 2, 'visualizationSizes': {1: 2, 2: 2}}})
      .expect(res => {
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
  
  it('GET /api/dashboards', done => {
    request(server)
      .get('/api/dashboards')
      .expect(res => {
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
  
  it('GET /api/dashboards/:dashboard', done => {
    request(server)
      .get('/api/dashboards/' + cannedDashboard._id)
      .expect(res => {
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
  
  it('PUT /api/dashboards/:dashboard', done => {
    request(server)
      .put('/api/dashboards/' + cannedDashboard._id)
      .send({'title': 'dashboard1'})
      .expect(res => {
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
  
  it('DELETE /api/dashboards/:dashboard', done => {
    request(server)
      .delete('/api/dashboards/' + cannedDashboard._id)
      .expect(200, {}, done)
  })
 
  it('PUT /api/dashboards/:dashboard/visualizations', done => {
    request(server)
      .put('/api/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualization._id.toString(),
        '__v': 0,
        'name': 'visualization'
      }], done)
  })
  
  it('GET /api/dashboards/:dashboard/visualizations', done => {
    request(server)
      .put('/api/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .end(() => {
        request(server)
          .get('/api/dashboards/' + cannedDashboard._id + '/visualizations')
          .expect(res => {
            res.body[0].__v = 0
          })
          .expect(200, [{
            '_id': cannedVisualization._id.toString(),
            '__v': 0,
            'name': 'visualization'
          }], done)
      })
  })
  
  it('DELETE /api/dashboards/:dashboard/visualizations/:visualization', done => {
    // First add visualization-type to analytic so we can test deleting it
    request(server)
      .put('/api/dashboards/' + cannedDashboard._id + '/visualizations')
      .send({'visualizations': [cannedVisualization._id]})
      .end(() => {
        // Test delete
        request(server)
          .delete('/api/dashboards/' + cannedDashboard._id + '/visualizations/' + cannedVisualization._id)
          .expect(200, [], done)
      })
  })
})
