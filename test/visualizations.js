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

describe('CRUD for sources', function () {
  beforeEach(function (done) {
    createObject(Source, {'name': 'source'})
      .then((source) => {
        cannedSource = source
        
        createObject(Analytic, {'name': 'analytic'})
          .then((analytic) => {
            cannedAnalytic = analytic
            
            createObject(VisualizationType, {'name': 'chart'})
              .then((visualizationType) => {
                cannedVisualizationType = visualizationType
                
                createObject(Visualization, {
                  'name': 'visualization',
                  'source': cannedSource._id.toString(),
                  'analytic': cannedAnalytic._id.toString(),
                  'visualizationType': cannedVisualizationType._id.toString()
                })
                  .then((visualization) => {
                    cannedVisualization = visualization
                    
                    done()
                  })
              })
          })
      })
      .catch(error => {
        console.log('Error: ' + error)
        done()
      })
  })
  
  afterEach(function (done) {
    removeObject(Source)
    .then(removeObject(Analytic))
    .then(removeObject(VisualizationType))
    .then(removeObject(Visualization))
    .then(done())
    .catch(error => {
      console.log('Error: ' + error)
      done()
    })
  })
  
  it('POST /sources', function testPostVisualization (done) {
    request(server)
      .post('/visualizations')
      .send({'name': 'visualization'})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
      })
      .expect(200, {
        'name': 'visualization',
        '__v': 0,
        '_id': 1
      }, done)
  })
  
  it('GET /visualizations', function testGetVisualizations (done) {
    request(server)
      .get('/visualizations')
      .expect(function (res) {
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
  
  it('GET /visualizations/:visualization', function testGetVisualization (done) {
    request(server)
      .get('/visualizations/' + cannedVisualization._id)
      .expect(function (res) {
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
  
  it('PUT /visualizations/:visualization', function testPutVisualization (done) {
    request(server)
      .put('/visualizations/' + cannedVisualization._id)
      .send({'name': 'visualization1'})
      .expect(function (res) {
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
  
  it('DELETE /visualizations/:visualization', function testDeleteVisualization (done) {
    request(server)
      .delete('/visualizations/' + cannedVisualization._id)
      .expect(200, {}, done)
  })
})
function createObject (model, json) {
  return new Promise(function (resolve, reject) {
    model.create(json, function (err, result) {
      if (err) { reject(err) }
      
      resolve(result)
    })
  })
}

function removeObject (model) {
  return new Promise(function (resolve, reject) {
    model.remove({}, function (err, result) {
      if (err) { reject(err) }
      
      resolve(result)
    })
  })
}
