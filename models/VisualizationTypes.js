var mongoose = require('mongoose');

var VisualizationTypeSchema = new mongoose.Schema({
  name: String,
  visualizationParams: mongoose.Schema.Types.Mixed
});

mongoose.model('VisualizationType', VisualizationTypeSchema);
