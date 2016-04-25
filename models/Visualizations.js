var mongoose = require('mongoose');

var VisualizationSchema = new mongoose.Schema({
  name: String,
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  visualizationType: { type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationType' },
  analytic: { type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' },
  visualizationParams: mongoose.Schema.Types.Mixed,
  filters: mongoose.Schema.Types.Mixed,
  analyticParams: mongoose.Schema.Types.Mixed
});

mongoose.model('Visualization', VisualizationSchema);