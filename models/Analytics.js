const mongoose = require('mongoose')

const AnalyticSchema = new mongoose.Schema({
  name: String,
  visualizationTypes: [{type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationType'}]
})

mongoose.model('Analytic', AnalyticSchema)
