import React, { useState } from "react";
import { useNavigate } from "react-router";

import './Landing.css'

import neuralNetworkPic from '../assets/neuralNetwork.png'

function Landing() {
    const [isCharacterVision, setIsCharacterVision] = useState(false)
    const [isCharacterBrain, setIsCharacterBrain] = useState(false)
    const [isCharacterDecisions, setIsCharacterDecisions] = useState(false)
    const [isGeneticAlgorithm, setIsGeneticAlgorithm] = useState(false)
    const [isEvolution, setIsEvolution] = useState(false)

    const navigate = useNavigate()

    function toGameHandler() {
        navigate("/play")
    }

    function openDetails(n) {
        if (n === 0) setIsCharacterVision(true)
        else if (n === 1) setIsCharacterBrain(true)
        else if (n === 2) setIsCharacterDecisions(true)
        else if (n === 3) setIsGeneticAlgorithm(true)
        else if (n === 4) setIsEvolution(true)
    }

    function closeDetails() {
        if (isCharacterVision) setIsCharacterVision(false)
        if (isCharacterBrain) setIsCharacterBrain(false)
        if (isCharacterDecisions) setIsCharacterDecisions(false)
        if (isGeneticAlgorithm) setIsGeneticAlgorithm(false)
        if (isEvolution) setIsEvolution(false)
    }

    return (
        <div className="landingContainer">
                {isCharacterVision &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Character's Vision</p>
                        <p className="detailsText">The character has a set of rays (sensors) emanating from its position, which detect the distances to the nearest obstacles. These distances are used as inputs to the neural network. The drawSensors() function is responsible for drawing the rays and calculating the distances. It iterates through the obstacles and calls rayObstacleIntersection() to find the intersection point between each ray and the obstacle's hitbox. The intersection function uses the Liang-Barsky algorithm to calculate the intersection points.</p>
                    </div>
                </div>}
                {isCharacterBrain &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Character's Brain - Neural Network</p>
                        <p className="detailsText">The character's brain (neural network) processes the input from the sensors and outputs an array of actions for the character. It consists of an input layer (13 neurons, 1 for each ray/sensor), a hidden layer (10 neurons), and an output layer (4 neurons). Each layer has neurons that store weights and biases. The input layer receives the distances from the sensors, and each neuron in the hidden layer calculates a weighted sum of the inputs, applies an activation function (ReLU), and passes the result to the next layer. The output layer calculates a similar weighted sum and applies a sigmoid activation function, producing an output in the range of 0 to 1. In this case, there are 4 outputs corresponding to 4 possible actions: move left, jump, move right, and duck.</p>
                    </div>
                </div>}
                {isCharacterDecisions &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Character's Decisions</p>
                        <p className="detailsText">The output from the character's brain (neural network) is used to decide which action the character will take. If the output value is greater than or equal to 0.5, the corresponding action will be performed.</p>
                    </div>
                </div>}
                {isGeneticAlgorithm &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Genetic Algorithm</p>
                        <p className="detailsText">The genetic algorithm is used to evolve the neural networks in the population of characters. The algorithm consists of the following steps:
                            <br/>
                            <br/>
                            Initialization: The initial population is created with a set of characters. If there is a stored neural network in the local storage (from a previous run), the best brain is loaded and used as the basis for creating the initial population with mutations. If no stored network is available, random initial characters are created.
                            <br/>
                            <br/>
                            Fitness Evaluation: Each character is run through the game environment, and its fitness is determined based on the distance it travels before colliding with an obstacle. The runCharacter() function handles the character's movement through the environment, updating its position, drawing its sensors, and feeding the sensor data to the neural network.
                            <br/>
                            <br/>
                            Selection: The character with the highest fitness (distance traveled) is selected as the best character.
                            <br/>
                            <br/>
                            Reproduction: The next generation of characters is created by copying the best character's neural network and applying mutations. The mutation function NeuralNetwork.mutate() introduces random changes in the weights and biases of the network.
                            <br/>
                            <br/>
                            Replacement: The old population of characters is replaced with the new population created in the reproduction step.</p>
                    </div>
                </div>}
                {isEvolution &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Evolution</p>
                        <p className="detailsText">The genetic algorithm is run for a specified number of generations, evolving the population of characters. After each generation, the best neural network is stored in the local storage.</p>
                    </div>
                </div>}
            <div className="landingHeaderContainer">
                <div className="landingHeaderLeft">
                    <p className="landingHeaderLeftLogo">Evolve</p>
                </div>
                <div className="landingHeaderRight">
                    <div className="landingHeaderRightNav">
                        <button className="landingHeaderRightNavButton" onClick={toGameHandler}>Play</button>
                    </div>
                </div>
            </div>
            <div className="landingBodyContainer">
                <div className="landingBodyHeroContainer">
                    <p className="landingBodyHeroTitle">An intelligent character roaming a spooky forest.</p>
                    <button className="landingBodyHeroButton" onClick={toGameHandler}>Play Now</button>
                </div>
                <div className="landingBodyAboutContainer">
                    <div className="landingBodyAboutLeft">
                        <p className="landingBodyAboutLeftTitle">How It Works</p>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(0)}>Character's Vision</button>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(1)}>Character's Brain - Neural Network</button>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(2)}>Character's Decisions</button>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(3)}>Genetic Algorithm</button>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(4)}>Evolution</button>
                    </div>
                    <div className="landingBodyAboutRight">
                        <p className="landingBodyAboutRightText">Character's Brain</p>
                        <p className="landingBodyAboutRightText2">13 Input Neurons, 10 Hidden Neurons, 4 Output Neurons</p>
                        <img src={neuralNetworkPic} className="landingBodyAboutRightPic"/>
                    </div>
                </div>
            </div>
            <div className="landingFooterContainer">
                <a href="https://www.linkedin.com/in/carlos-macariooo/" className="landingFooterContainerLink">LinkedIn</a>
                <a href="https://github.com/cmacariovx" className="landingFooterContainerLink">GitHub</a>
                <a href="https://cmacariovx.github.io/carlosmacario/" className="landingFooterContainerLink">Portfolio</a>
            </div>
        </div>
    )
}

export default Landing
