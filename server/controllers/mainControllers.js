const mongo = require('../mongo')
require("dotenv").config()

async function fetchBrain(req, res, next) {
    const { velocity } = req.body
    if (!velocity) return null

    let fetchBrainResult = await mongo.fetchBrain(req, res, next, velocity)
}

exports.fetchBrain = fetchBrain
