var mongoose = require('mongoose');

var VisualizationSchema = new mongoose.Schema({
  name: String,
  visualizationParams: mongoose.Schema.Types.Mixed
});

mongoose.model('Visualization', VisualizationSchema);
