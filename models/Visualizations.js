var mongoose = require('mongoose');

var VisualizationSchema = new mongoose.Schema({
  name: String,
  analytic: { type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' },
  visualizationParams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationParam' }]
});

mongoose.model('Visualization', VisualizationSchema);
