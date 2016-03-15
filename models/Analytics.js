var mongoose = require('mongoose');

var AnalyticSchema = new mongoose.Schema({
  name: String,
  analyticParams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticParam' }],
  visualizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' }]
});

mongoose.model('Analytic', AnalyticSchema);
