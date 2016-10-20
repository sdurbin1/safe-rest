const express = require('express')
const mongoose = require('mongoose')
const mongoUtils = require('../utils/mongoUtil')

const router = express.Router()
const Alert = mongoose.model('Alert')

module.exports = router

/* GET /alerts */
router.get('/', (req, res, next) => {
  mongoUtils.getAllModelObject(Alert, res, next)
})

/* PUT /dashboards */
router.put('/', (req, res, next) => {
  const alert = new Alert(req.body)

  mongoUtils.returnResults(alert.save(), res, next)
})

/* POST /alerts */
router.post('/', (req, res, next) => {
  mongoUtils.returnResults(
    Alert.findOneAndUpdate({'_id': req.body._id}, req.body, {new: true}), res, next
  )
})