var mongoose = require('mongoose');

var DashboardSchema = new mongoose.Schema({
  name: String,
  charts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chart' }]
});

mongoose.model('Dashboard', DashboardSchema);