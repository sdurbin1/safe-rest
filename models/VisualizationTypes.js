const mongoose = require('mongoose')

const VisualizationTypeSchema = new mongoose.Schema({
  name: String,
  queryLimit: Number
})

mongoose.model('VisualizationType', VisualizationTypeSchema)
