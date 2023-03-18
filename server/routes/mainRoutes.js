const express = require("express")
const mainControllers = require('../controllers/mainControllers')

const router = express.Router()

router.post('/fetchBrain', mainControllers.fetchBrain)

module.exports = router
