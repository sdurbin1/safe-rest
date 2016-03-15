var mongoose = require('mongoose');

var VisualizationParamSchema = new mongoose.Schema({
  name: String,
  visualization: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' }
});

mongoose.model('VisualizationParam', VisualizationParamSchema);
