var mongoose = require('mongoose');

var VisualizationSchema = new mongoose.Schema({
  name: String,
  analytic: { type: mongoose.Schema.Types.ObjectId, ref: 'Analytic' }
});

mongoose.model('Visualization', VisualizationSchema);
