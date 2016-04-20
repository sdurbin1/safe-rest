var mongoose = require('mongoose');

var ChartSchema = new mongoose.Schema({
  name: String,
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  visualization: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualization' },
  analytic: { type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' },
  chartParams: mongoose.Schema.Types.Mixed,
  filters: mongoose.Schema.Types.Mixed,
  analyticParams: mongoose.Schema.Types.Mixed
});

mongoose.model('Chart', ChartSchema);