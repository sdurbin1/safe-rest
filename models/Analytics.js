var mongoose = require('mongoose');

var AnalyticSchema = new mongoose.Schema({
  name: String,
  analyticParams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticParam' }],
  visualizationTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisualizationType' }]
});

mongoose.model('Analytic', AnalyticSchema);
