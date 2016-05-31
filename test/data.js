const request = require('supertest')
const mongoose = require('mongoose')
const mongoUtil = require('../utils/mongoUtil')

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
const testData = [
  {'Age': 21, 'County': 'Anne Arundel'},
  {'Age': 33, 'County': 'Howard'},
  {'Age': 29, 'County': 'Anne Arundel'}
]

describe('Test data', function () {
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
    mongoUtil.deleteDocument(server.get('db'), cannedSource._id.toString())
    .then(removeObject(Source))
    .then(removeObject(Analytic))
    .then(removeObject(VisualizationType))
    .then(removeObject(Visualization))
    .then(done())
    .catch(error => {
      console.log('Error: ' + error)
    })
  })
  
  it('POST /sources/:source/data', function testPostData (done) {
    request(server)
      .post('/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .expect(function (res) {
        res.body.__v = 0
        res.body._id = 1
        res.body.source.__v = 0
      })
      .expect(200, {
        '__v': 0,
        '_id': 1,
        'source': {
          '__v': 0,
          '_id': cannedSource._id.toString(),
          'analytics': [],
          'name': 'source'
        },
        'upload': {
          'success': true
        }
      }, done)
  })
  
  it('POST /sources/data', function testPostDataCreateSource (done) {
    let sourceId
    
    request(server)
      .post('/sources/data')
      .send({
        'document': testData,
        'source': {'name': 'source1'}
      })
      .expect(function (res) {
        sourceId = res.body.source._id
        res.body.__v = 0
        res.body._id = 1
        res.body.source.__v = 0
        res.body.source._id = 1
      })
      .expect(200, {
        '__v': 0,
        '_id': 1,
        'source': {
          '__v': 0,
          '_id': 1,
          'analytics': [],
          'name': 'source1'
        },
        'upload': {
          'success': true
        }
      }, function () {
        mongoUtil.deleteDocument(server.get('db'), sourceId)
        done()
      })
  })
  
  it('GET /sources/:source/hasData', function testSourceHasData (done) {
    request(server)
      .post('/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(function () {
        request(server)
          .get('/sources/' + cannedSource._id + '/hasData')
          .expect(200, {
            'hasData': true
          }, done)
      })
  })
  
  it('GET /sources/:source/hasData', function testSourceHasData (done) {
    request(server)
      .post('/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(function () {
        request(server)
          .get('/sources/' + cannedSource._id + '/hasData')
          .expect(200, {
            'hasData': true
          }, done)
      })
  })
  
  it('DELETE /sources/:source/data', function testSourceDeleteData (done) {
    request(server)
      .post('/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(function () {
        request(server)
          .delete('/sources/' + cannedSource._id + '/data')
          .expect(200, {'success': true}, done)
      })
  })
  
  it('POST /sources/:source/query', function testSourceQueryData (done) {
    request(server)
      .post('/sources/' + cannedSource._id + '/data')
      .send({'document': testData})
      .end(function () {
        request(server)
          .post('/sources/' + cannedSource._id + '/query')
          .expect(function (res) {
            res.body[0]._id = 1
            res.body[1]._id = 1
            res.body[2]._id = 1
          })
          .expect(200, [
            {'_id': 1, 'Age': 21, 'County': 'Anne Arundel'},
            {'_id': 1, 'Age': 33, 'County': 'Howard'},
            {'_id': 1, 'Age': 29, 'County': 'Anne Arundel'}
          ], done)
      })
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
