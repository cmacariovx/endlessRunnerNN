package com.evolve.main.service;

import org.springframework.stereotype.Service;

import com.evolve.main.repository.BrainRepository;

@Service
public class BrainService {
    private final BrainRepository brainRepository;

    public BrainService(BrainRepository brainRepository) {
        this.brainRepository = brainRepository;
    }

    public void saveBrain(String brain, int maxDistance) {
        try {
            this.brainRepository.saveBrain(brain, maxDistance);
        }
        catch (Exception err) {
            System.out.println("Brain Service - Save Brain: " + err.getMessage());
            throw new RuntimeException("Could not save brain in DB.", err);
        }
    }

    public String fetchBrain() {
        try {
            return brainRepository.fetchBrain();
        }
        catch (Exception err) {
            System.out.println("Brain Service - Fetch Brain: " + err.getMessage());
            throw new RuntimeException("Could not fetch brain.", err);
        }
    }
}
