const mongoose = require('mongoose')

const DashboardSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  visualizations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Visualization'}]
})

mongoose.model('Dashboard', DashboardSchema)
