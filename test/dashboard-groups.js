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

describe('CRUD for dashboardGroups', () => {
  beforeEach((done) => {
    DashboardGroup
      .create({'title': 'group'})
      .then(dashboardGroup => {
        cannedDashboardGroup = dashboardGroup
        
        return Dashboard.create({
          'title': 'dashboard',
          'subtitle': 'subtitle',
          'dashboardParams': {'size': 2, 'visualizationSizes': {1: 2, 2: 2}}
        })
      })
      .then(dashboard => {
        server.start
        cannedDashboard = dashboard
      
        done()
      })
      .catch(err => { throw err })
  })
  
  afterEach(done => {
    DashboardGroup.remove({})
    .then(() => Dashboard.remove({}))
    .then(() => {
      server.stop
      
      done()
    })
    .catch(err => { throw err })
  })
  
  it('POST /api/dashboard-groups', done => {
    request(server)
      .post('/api/dashboard-groups')
      .send({'title': 'group1'})
      .expect(res => {
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
  
  it('GET /api/dashboard-groups', done => {
    request(server)
      .get('/api/dashboard-groups')
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group',
        'dashboards': [],
        '__v': 0
      }], done)
  })
  
  it('GET /api/dashboard-groups/:dashboard-group', done => {
    request(server)
      .get('/api/dashboard-groups/' + cannedDashboardGroup._id)
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group',
        'dashboards': [],
        '__v': 0
      }, done)
  })
  
  it('PUT /api/dashboard-groups/:dashboard-group', done => {
    request(server)
      .put('/api/dashboard-groups/' + cannedDashboardGroup._id)
      .send({'title': 'group1'})
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedDashboardGroup._id.toString(),
        'title': 'group1',
        'dashboards': [],
        '__v': 0
      }, done)
  })
  
  it('DELETE /api/dashboard-groups/:dashboard-group', done => {
    request(server)
      .delete('/api/dashboard-groups/' + cannedDashboardGroup._id)
      .expect(200, {}, done)
  })
  
  it('GET /api/dashboard-groups/:dashboard-group/visualizations', done => {
    request(server)
      .put('/api/dashboard-groups/' + cannedDashboardGroup._id)
      .send({'dashboards': [cannedDashboard._id]})
      .end(() => {
        request(server)
          .get('/api/dashboard-groups/' + cannedDashboardGroup._id + '/dashboards')
          .expect(res => {
            res.body[0].__v = 0
          })
          .expect(200, [cannedDashboard._id.toString()], done)
      })
  })
})