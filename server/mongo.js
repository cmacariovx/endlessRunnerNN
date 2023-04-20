const { Pool } = require('pg');
require('dotenv').config()
const connectionString = process.env.POSTGRES_URL;
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function fetchBrain(req, res, next, newNeuralNetwork) {
  if (newNeuralNetwork) {
    res.json({ error: 'oops' });
    return;
  }

  try {
    const result = await pool.query('SELECT * FROM brains WHERE id = 1');
    const brainData = JSON.parse(result.rows[0].brain);
    res.json({ ...result.rows[0], brain: brainData });

  } catch (error) {
    res.status(500).json({ message: 'Could not fetch brain' });
  }
}

async function saveBrain(req, res, next, brain, maxDistance) {
    try {
      const insertQuery =
        'INSERT INTO brains (id, brain, max_distance) VALUES (1, $1, $2) ON CONFLICT (id) DO UPDATE SET brain = $1, max_distance = $2';
      const values = [brain, maxDistance];
      await pool.query(insertQuery, values);
      res.json({ message: 'Brain saved successfully' });
    } catch (error) {
      res.status(500).json({ message: error });
    }
}

exports.fetchBrain = fetchBrain;
exports.saveBrain = saveBrain;
