import React, { useState } from "react";
import { useNavigate } from "react-router";

import './Landing.css'

import neuralNetworkPic from '../assets/neuralNetwork.png'

function Landing() {
    const [isCharacterVision, setIsCharacterVision] = useState(false)
    const [isCharacterBrain, setIsCharacterBrain] = useState(false)
    const [isGeneticAlgorithm, setIsGeneticAlgorithm] = useState(false)
    const [isEvolution, setIsEvolution] = useState(false)

    const navigate = useNavigate()

    function toGameHandler() {
        navigate("/play")
    }

    function openDetails(n) {
        if (n === 0) setIsCharacterVision(true)
        else if (n === 1) setIsCharacterBrain(true)
        else if (n === 3) setIsGeneticAlgorithm(true)
        else if (n === 4) setIsEvolution(true)
    }

    function closeDetails() {
        if (isCharacterVision) setIsCharacterVision(false)
        if (isCharacterBrain) setIsCharacterBrain(false)
        if (isGeneticAlgorithm) setIsGeneticAlgorithm(false)
        if (isEvolution) setIsEvolution(false)
    }

    return (
        <div className="landingContainer">
                {isCharacterVision &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Character's Vision</p>
                        <p className="detailsText">This character is equipped with sensors that are rays projected from the character's position at various angles. These sensors use the Liang-Barsky algorithm to detect obstacles by calculating the intersection of the sensor lines with the obstacle's hitbox. The Liang-Barsky algorithm is a computationally efficient line-clipping algorithm that checks if a line segment intersects a rectangular bounding box, providing the intersection points if they exist.

                        Once the sensors detect the obstacles, the distances between the character and the obstacles are measured and normalized into a range between 0 and 1. These normalized values are arranged in an array that serves as the input data for the neural network.</p>
                    </div>
                </div>}
                {isCharacterBrain &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Character's Brain - Neural Network</p>
                        <p className="detailsText">The neural network processes the input data (sensor readings) through layers of interconnected nodes or neurons. Each node performs a weighted sum of its inputs and applies an activation function to the result. In our project, we use the Exponential Linear Unit (ELU) activation function, which has the advantage of reducing the vanishing gradient problem during training. The ELU function is defined as:
                        <br></br>
                        <br></br>
                        {'ELU(x) = x, if x > 0 = α(exp(x) - 1), if x ≤ 0'}
                        <br></br>
                        <br></br>

                        where α is a hyperparameter, typically set to 1.

                        The output layer of the neural network uses the softmax function, which converts the raw output values into probabilities. The softmax function takes the exponential of each output value and normalizes the result so that the sum of the probabilities is equal to 1. This allows us to interpret the output as a probability distribution over the possible actions that the character should take, such as jumping or moving left or right.

                        During the training process, the neural network's weights are adjusted to minimize the error between the predicted outputs and the desired outputs.

                        To summarize, the character's advanced sensor system uses the Liang-Barsky algorithm to detect collisions in real-time, normalizes the ray distances, and feeds them to the neural network. The neural network utilizes the ELU activation function in the hidden layers and the softmax function in the output layer to produce a probability distribution over possible actions. This advanced architecture enables the character to make instantaneous complex decisions based on its environment, demonstrating a high level of technical sophistication.</p>
                    </div>
                </div>}
                {isGeneticAlgorithm &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">Genetic Algorithm</p>
                        <p className="detailsText">To find the best neural network for controlling the character, we employ a genetic algorithm. The genetic algorithm works with a population of neural networks, each having different weights. The fitness of each network is evaluated based on the character's performance in the game, such as the distance traveled or the number of obstacles avoided.
                        <br></br>
                        <br></br>
                        The genetic algorithm proceeds in generations. In each generation, networks with higher fitness scores are more likely to be selected for reproduction. Reproduction involves slight mutation of the previous generations best brain to create new networks. This process mimics the natural process of evolution, aiming to produce better-performing networks over time.
                        <br></br>
                        <br></br>
                        The best-performing networks are found by iterating through multiple generations and selecting the networks with the highest fitness scores. These networks are then used to control the character's movements in the game.</p>
                    </div>
                </div>}
                {isEvolution &&
                <div className="detailsBackdrop" onClick={closeDetails}>
                    <div className="detailsContainer">
                        <p className="detailsHeader">To Sum It All Up</p>
                        <p className="detailsText">In summary, this project showcases the power of artificial intelligence, neural networks, and genetic algorithms in creating a character that learns and adapts to its environment. By combining algorithms like the Liang-Barsky algorithm and activation functions such as ELU and softmax, this project pushes the boundaries of traditional bot gameplay, offering an engaging and interactive experience for players.</p>
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
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(3)}>Genetic Algorithm</button>
                        <button className="landingBodyAboutLeftOption" onClick={() => openDetails(4)}>To Sum It All Up</button>
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
