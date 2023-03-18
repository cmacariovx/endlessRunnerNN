const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
require("dotenv").config()

const mongoUrl = process.env.MONGO_URL

async function fetchBrain(req, res, next, newNeuralNetwork) {
    if (newNeuralNetwork) {
        res.json({error: "oops"})
        return
    }

    const client = new MongoClient(mongoUrl)
    await client.connect()
    const db = client.db("evolve")

    let response = await db.collection("brains").findOne({_id: new ObjectId("6415eb9d847424eb09191482")})

    client.close()
    res.json(response)
}

async function saveBrain(req, res, next, brain, maxDistance) {
    const client = new MongoClient(mongoUrl)
    let response

    try {
        await client.connect()
        const db = client.db("evolve")

        const update = {
            $set: {
              brain: brain,
              maxDistance: maxDistance,
            },
        }

        response = await db.collection("brains").updateOne({_id: new ObjectId("6415eb9d847424eb09191482")}, update)
    }
    catch(error) {
        return res.json({"message": "Could not save brain"})
    }

    client.close()
    res.json(response)
}

exports.fetchBrain = fetchBrain
exports.saveBrain = saveBrain
