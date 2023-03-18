const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
require("dotenv").config()

const mongoUrl = process.env.MONGO_URL

async function fetchBrain(req, res, next, velocity) {
    const client = new MongoClient(mongoUrl)
    await client.connect()
    const db = client.db("evolve")

    // velocity
    let response = await db.collection("brains").findOne({})

    client.close()
    res.json(response)
}

exports.fetchBrain = fetchBrain
