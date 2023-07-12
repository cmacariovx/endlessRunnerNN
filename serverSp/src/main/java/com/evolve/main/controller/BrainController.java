package com.evolve.main.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.HashMap;

import com.evolve.main.service.BrainService;

@RestController
public class BrainController {
    private final BrainService brainService;

    @Autowired
    public BrainController(BrainService brainService) {
        this.brainService = brainService;
    }

    @PostMapping("/saveBrain")
    public ResponseEntity<Object> saveBrain(@RequestBody String brain, int maxDistance) {
        try {
            this.brainService.saveBrain(brain, maxDistance);
            final HashMap<String, Boolean> response = new HashMap<>();
            response.put("brainSaved", true);
            return new ResponseEntity<Object>(response, HttpStatus.valueOf(200));
        }
        catch (Exception err) {
            System.out.println("Brain Controller - Save Brain: " + err.getMessage());

            final HashMap<String, String> error = new HashMap<>();
            error.put("error", err.getMessage());
            return new ResponseEntity<Object>(error, HttpStatus.valueOf(400));
        }
    }

    @PostMapping("/fetchBrain")
    public ResponseEntity<Object> fetchBrain(boolean newNeuralNetwork) {
        try {
            final String brain = this.brainService.fetchBrain(newNeuralNetwork);
            final HashMap<String, String> response = new HashMap<>();
            response.put("brain", brain);
            return new ResponseEntity<Object>(response, HttpStatus.valueOf(200));
        }
        catch (Exception err) {
            System.out.println("Brain Controller - Fetch Brain: " + err.getMessage());

            final HashMap<String, String> error = new HashMap<>();
            error.put("error", err.getMessage());
            return new ResponseEntity<Object>(error, HttpStatus.valueOf(400));
        }
    }
}
