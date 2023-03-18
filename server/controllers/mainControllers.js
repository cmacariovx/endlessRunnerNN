const mongo = require('../mongo')
require("dotenv").config()

async function fetchBrain(req, res, next) {
    const { newNeuralNetwork } = req.body

    let fetchBrainResult = await mongo.fetchBrain(req, res, next, newNeuralNetwork)
}

async function saveBrain(req, res, next) {
    const { brain, maxDistance } = req.body

    let saveBrainResult = await mongo.saveBrain(req, res, next, brain, maxDistance)
}

exports.fetchBrain = fetchBrain
exports.saveBrain = saveBrain
