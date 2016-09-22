const request = require('supertest')
const mongoose = require('mongoose')

require('../models/Visualizations')
require('../models/Analytics')
require('../models/Sources')
require('../models/VisualizationTypes')
const Visualization = mongoose.model('Visualization')
const Analytic = mongoose.model('Analytic')
const Source = mongoose.model('Source')
const VisualizationType = mongoose.model('VisualizationType')
const server = require('../app')
let cannedVisualization
let cannedAnalytic
let cannedSource
let cannedVisualizationType

process.env.NODE_ENV = 'test'

describe('CRUD for sources', () => {
  beforeEach(done => {
    Source
      .create({'name': 'source'})
      .then((source) => {
        cannedSource = source

        return Analytic.create({'name': 'analytic'})
      })
      .then((analytic) => {
        cannedAnalytic = analytic

        return VisualizationType.create({'name': 'chart'})
      })
      .then((visualizationType) => {
        cannedVisualizationType = visualizationType

        return Visualization.create({
          'name': 'visualization',
          'source': cannedSource._id.toString(),
          'analytic': cannedAnalytic._id.toString(),
          'visualizationType': cannedVisualizationType._id.toString()
        })
      })
      .then((visualization) => {
        cannedVisualization = visualization

        done()
      })
      .catch(err => {
        console.log('Error: ' + err)
        done()
      })
  })

  afterEach(done => {
    Source
      .remove()
      .then(() => Analytic.remove())
      .then(() => VisualizationType.remove())
      .then(() => Visualization.remove())
      .then(() => done())
      .catch(error => {
        console.log('Error: ' + error)
        done()
      })
  })

  it('POST /api/sources', done => {
    request(server)
      .post('/api/visualizations')
      .send({
        'name': 'visualization',
        'queryLimit': 10
      })
      .expect(res => {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'visualization',
        'queryLimit': 10,
        '__v': 0,
        '_id': 1
      }, done)
  })

  it('GET /api/visualizations', done => {
    request(server)
      .get('/api/visualizations')
      .expect(res => {
        res.body[0].__v = 0
      })
      .expect(200, [{
        '_id': cannedVisualization._id.toString(),
        'name': 'visualization',
        'source': {
          '_id': cannedSource._id.toString(),
          '__v': cannedSource.__v,
          'name': 'source',
          'analytics': []
        },
        'analytic': {
          '_id': cannedAnalytic._id.toString(),
          '__v': cannedAnalytic.__v,
          'name': 'analytic',
          'visualizationTypes': []
        },
        'visualizationType': {
          '_id': cannedVisualizationType._id.toString(),
          '__v': cannedVisualizationType.__v,
          'name': 'chart'
        },
        '__v': 0
      }], done)
  })

  it('GET /api/visualizations/:visualization', done => {
    request(server)
      .get('/api/visualizations/' + cannedVisualization._id)
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualization._id.toString(),
        'name': 'visualization',
        'source': {
          '_id': cannedSource._id.toString(),
          '__v': cannedSource.__v,
          'name': 'source',
          'analytics': []
        },
        'analytic': {
          '_id': cannedAnalytic._id.toString(),
          '__v': cannedAnalytic.__v,
          'name': 'analytic',
          'visualizationTypes': []
        },
        'visualizationType': {
          '_id': cannedVisualizationType._id.toString(),
          '__v': cannedVisualizationType.__v,
          'name': 'chart'
        },
        '__v': 0
      }, done)
  })

  it('PUT /api/visualizations/:visualization', done => {
    request(server)
      .put('/api/visualizations/' + cannedVisualization._id)
      .send({'name': 'visualization1'})
      .expect(res => {
        res.body.__v = 0
      })
      .expect(200, {
        '_id': cannedVisualization._id.toString(),
        'name': 'visualization1',
        'source': {
          '_id': cannedSource._id.toString(),
          '__v': cannedSource.__v,
          'name': 'source',
          'analytics': []
        },
        'analytic': {
          '_id': cannedAnalytic._id.toString(),
          '__v': cannedAnalytic.__v,
          'name': 'analytic',
          'visualizationTypes': []
        },
        'visualizationType': {
          '_id': cannedVisualizationType._id.toString(),
          '__v': cannedVisualizationType.__v,
          'name': 'chart'
        },
        '__v': 0
      }, done)
  })

  it('DELETE /api/visualizations/:visualization', done => {
    request(server)
      .delete('/api/visualizations/' + cannedVisualization._id)
      .expect(200, {}, done)
  })
})