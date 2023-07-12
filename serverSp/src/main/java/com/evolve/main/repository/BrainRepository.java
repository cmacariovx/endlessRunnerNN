package com.evolve.main.repository;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class BrainRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void saveBrain(String brain, int maxDistance) {
        try {
            jdbcTemplate.update(
                "INSERT INTO brains (id, brain, max_distance) VALUES (1, ?, ?) ON CONFLICT ON CONSTRAINT brains_pkey DO UPDATE SET brain = ?, max_distance = ?",
                brain, maxDistance, brain, maxDistance
            );
        }
        catch (Exception err) {
            System.out.println("Brain Repository - Save Brain: " + err.getMessage());
            throw new RuntimeException("Could not save brain in DB.", err);
        }
    }

    public String fetchBrain(boolean newNeuralNetwork) {
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap("SELECT * FROM brains WHERE id = 1");
            return (String)row.get("brain");
        }
        catch (Exception err) {
            System.out.println("Brain Repository - Fetch Brain: " + err.getMessage());
            throw new RuntimeException("Could not fetch brain.", err);
        }
    }
}
