const mongoose = require('mongoose')

const VisualizationTypeSchema = new mongoose.Schema({
  name: String
})

mongoose.model('VisualizationType', VisualizationTypeSchema)
