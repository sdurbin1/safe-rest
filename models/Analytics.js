var mongoose = require('mongoose');

var AnalyticSchema = new mongoose.Schema({
  name: String,
  analyticParams: mongoose.Schema.Types.Mixed,
  visualizationTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationType' }]
});

mongoose.model('Analytic', AnalyticSchema);
