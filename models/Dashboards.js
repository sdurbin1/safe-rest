var mongoose = require('mongoose');

var DashboardSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  charts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chart' }]
});

mongoose.model('Dashboard', DashboardSchema);