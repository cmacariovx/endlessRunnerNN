[Evolve - An Evolutionary AI Game](https://spill-7cae7.web.app/ "Spill")

### Evolve is a game featuring an intelligent character powered by a neural network in an endless runner.

This character must successfully navigate through an obstacle-filled environment using artificial intelligence. This project combines concepts from artificial intelligence, neural networks, and genetic algorithms to create a character that adapts and improves its performance in the game.

Starting from a new neural network, with a population of 100, instead of our trained neural network, will evolve a character that can successfully navigate over obstacles with astonishing speed and accuracy, on average in <20 Generations or <7 Min.

Starting from our trained neural network, with a population of 100, will evolve a character that can successfully navigate over obstacles also with astonishing speed and accuracy, on average in <5 Generations or <2 Min.

### Character's Sensors

This character is equipped with sensors that are rays projected from the character's position at various angles. These sensors use the Liang-Barsky algorithm to detect obstacles by calculating the intersection of the sensor lines with the obstacle's hitbox. The Liang-Barsky algorithm is a computationally efficient line-clipping algorithm that checks if a line segment intersects a rectangular bounding box, providing the intersection points if they exist.

Once the sensors detect the obstacles, the distances between the character and the obstacles are measured and normalized into a range between 0 and 1. These normalized values are arranged in an array that serves as the input data for the neural network.

### Neural Network

The neural network processes the input data (sensor readings) through layers of interconnected nodes or neurons. Each node performs a weighted sum of its inputs and applies an activation function to the result. In our project, we use the Exponential Linear Unit (ELU) activation function, which has the advantage of reducing the vanishing gradient problem during training. The ELU function is defined as:

ELU(x) = x, if x > 0
= α(exp(x) - 1), if x ≤ 0

where α is a hyperparameter, typically set to 1.

The output layer of the neural network uses the softmax function, which converts the raw output values into probabilities. The softmax function takes the exponential of each output value and normalizes the result so that the sum of the probabilities is equal to 1. This allows us to interpret the output as a probability distribution over the possible actions that the character should take, such as jumping or moving left or right.

During the training process, the neural network's weights are adjusted to minimize the error between the predicted outputs and the desired outputs.

To summarize, the character's advanced sensor system uses the Liang-Barsky algorithm to detect collisions in real-time, normalizes the ray distances, and feeds them to the neural network. The neural network utilizes the ELU activation function in the hidden layers and the softmax function in the output layer to produce a probability distribution over possible actions. This advanced architecture enables the character to make instantaneous complex decisions based on its environment, demonstrating a high level of technical sophistication.

### Genetic Algorithm

To find the best neural network for controlling the character, we employ a genetic algorithm. The genetic algorithm works with a population of neural networks, each having different weights. The fitness of each network is evaluated based on the character's performance in the game, such as the distance traveled or the number of obstacles avoided.

The genetic algorithm proceeds in generations. In each generation, networks with higher fitness scores are more likely to be selected for reproduction. Reproduction involves crossover (exchanging weights between two parent networks) and mutation (randomly altering some weights) to create new networks. This process mimics the natural process of evolution, aiming to produce better-performing networks over time.

The best-performing networks are found by iterating through multiple generations and selecting the networks with the highest fitness scores. These networks are then used to control the character's movements in the game.

### To Sum It All up

In summary, this project showcases the power of artificial intelligence, neural networks, and genetic algorithms in creating a character that learns and adapts to its environment. By combining algorithms like the Liang-Barsky algorithm and activation functions such as ELU and softmax, this project pushes the boundaries of traditional bot gameplay, offering an engaging and interactive experience for players.
