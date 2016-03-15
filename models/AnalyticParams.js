var mongoose = require('mongoose');

var AnalyticParamSchema = new mongoose.Schema({
  name: String,
  analytic: { type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' }
});

mongoose.model('AnalyticParam', AnalyticParamSchema);
