var mongoose = require('mongoose');

var VisualizationTypeSchema = new mongoose.Schema({
  name: String
});

mongoose.model('VisualizationType', VisualizationTypeSchema);
