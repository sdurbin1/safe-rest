const mongoose = require('mongoose')
const mongoExecute = require('../utils/mongoExecute')

const VisualizationSchema = new mongoose.Schema({
  name: String,
  source: {type: mongoose.Schema.Types.ObjectId, ref: 'Source'},
  visualizationType: {type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationType'},
  analytic: {type: mongoose.Schema.Types.ObjectId, ref: 'Analytic'},
  visualizationParams: mongoose.Schema.Types.Mixed,
  filters: mongoose.Schema.Types.Mixed,
  analyticParams: mongoose.Schema.Types.Mixed
})

mongoose.model('Visualization', VisualizationSchema)

VisualizationSchema.methods.execute = function execute (queryJson, db) {
  return mongoExecute.mongoExecute(queryJson, db, this)
}

delete mongoose.connection.models['Visualization']
mongoose.model('Visualization', VisualizationSchema)
