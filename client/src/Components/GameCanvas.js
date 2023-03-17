import React, { useEffect, useRef } from "react"

import backgroundMain from '../assets/demonwoodsmain.png'
import floor1 from '../assets/OakWoodsLandscape/decorations/floor1.png'
import floor2 from '../assets/OakWoodsLandscape/decorations/floor8.png'
import fullIdle from '../assets/NightBorneCharacter/NightborneIdleMain.png'
import idle1 from '../assets/NightBorneCharacter/idle1.png'
import idle2 from '../assets/NightBorneCharacter/idle2.png'
import fire from '../assets/fire_fx_v1.0/png/orange/loops/burning_loop_1.png'

import './GameCanvas.css'

function GameCanvas() {
    const gameCanvasRef = useRef(null)
    const visualizerCanvasRef = useRef(null)
    const simulationStarted = useRef(false)

    useEffect(() => {
        let gameCanvas = gameCanvasRef.current
        let gameCtx = gameCanvas.getContext("2d")

        gameCanvas.height = 576
        gameCanvas.width = 1024

        gameCtx.fillStyle = 'black'
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

        let visualizerCanvas = visualizerCanvasRef.current
        let visualizerCtx = visualizerCanvas.getContext("2d")

        visualizerCanvas.height = 576
        visualizerCanvas.width = 576

        visualizerCtx.fillStyle = '#010409'
        visualizerCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

        const gravity = 0.2

        class Background {
            constructor({ position, imageSrc }) {
                this.position = position
                this.height = 150
                this.width = 50
                this.image = new Image()
                this.image.src = imageSrc
            }

            draw() {
                gameCtx.drawImage(this.image, this.position.x, this.position.y)
            }

            update() {
                this.draw()
            }
        }

        const background = new Background({
            position: {
                x: 0,
                y: 0
            },
            imageSrc: backgroundMain
        })

        const keys = {
            a: {
                pressed: false
            },
            d: {
                pressed: false
            }
        }

        let lastKey

        class Level {
            constructor(inputCount, outputCount) {
                this.inputs = new Array(inputCount)
                this.outputs = new Array(outputCount)
                this.biases = new Array(outputCount)
                this.weights = []

                for (let i = 0; i < inputCount; i++) {
                    this.weights[i] = new Array(outputCount)
                }

                Level.randomize(this)
            }

            static randomize(level) {
                for (let i = 0; i < level.inputs.length; i++) {
                    for (let j = 0; j < level.outputs.length; j++) {
                        level.weights[i][j] = Math.random() * 2 - 1
                    }
                }

                for (let i = 0; i < level.biases.length; i++) {
                    level.biases[i] = Math.random() * 2 - 1
                }
            }

            static feedForward(givenInputs, level) {
                for (let i = 0; i < level.inputs.length; i++) {
                    level.inputs[i] = givenInputs[i]
                }

                for (let i = 0; i < level.outputs.length; i++) {
                    let sum = 0
                    for (let j = 0; j < level.inputs.length; j++) {
                        sum += level.inputs[j] * level.weights[j][i]
                    }

                    if (sum > level.biases[i]) {
                        level.outputs[i] = 1
                    }
                    else {
                        level.outputs[i] = 0
                    }
                }

                return level.outputs
            }
        }

        class NeuralNetwork {
            constructor(neuronCounts) {
                this.levels = []

                for (let i = 0; i < neuronCounts.length - 1; i++) {
                    this.levels.push(new Level(
                        neuronCounts[i], neuronCounts[i + 1]
                    ))
                }
            }

            static feedForward(givenInputs, network) {
                let outputs = Level.feedForward(
                    givenInputs, network.levels[0]
                )

                for (let i = 1; i < network.levels.length; i++) {
                    outputs = Level.feedForward(
                        outputs, network.levels[i]
                    )
                }

                return outputs
            }

            static mutate(network, amount = 1) {
                network.levels.forEach(level => {
                    for (let i = 0; i < level.biases.length; i++) {
                        level.biases[i] = lerp(level.biases[i], Math.random() * 2 - 1, amount)
                    }
                    for (let i = 0; i < level.weights.length; i++) {
                        for (let j = 0; j < level.weights[i].length; j++) {
                            level.weights[i][j] = lerp(level.weights[i][j], Math.random() * 2 - 1, amount)
                        }
                    }
                })
            }
        }

        let currentTimes = 0

        class Visualizer{
            static drawNetwork(ctx, network) {
                const margin = 50
                const left = margin
                const top = margin
                const width = ctx.canvas.width - margin * 2
                const height = ctx.canvas.height - margin * 2

                const levelHeight = height / network.levels.length


                for (let i = network.levels.length - 1; i >= 0; i--) {
                    const levelTop =
                    top +
                    lerp(height - levelHeight, 0, network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1))

                    Visualizer.drawLevel(
                        ctx, network.levels[i], left, levelTop, width, levelHeight,
                        i == network.levels.length - 1 ? ['🠈','🠉', '🠊','🠋'] : []
                    )
                }
            }

            static drawLevel(ctx, level, left, top, width, height, outputLabels) {
                const right = left + width
                const bottom = top + height
                const {inputs, outputs, weights, biases} = level

                if (currentTimes <= 3) {
                    for (let i = 0; i < inputs.length; i++) {
                        for (let j = 0; j < outputs.length; j++) {
                            ctx.beginPath()
                            ctx.moveTo(
                                Visualizer.getNodeX(inputs, i, left, right),
                                bottom
                            );
                            ctx.lineTo(
                                Visualizer.getNodeX(outputs, j, left, right),
                                top
                            );
                            ctx.lineWidth = 1
                            ctx.strokeStyle = 'lightblue'
                            ctx.stroke()
                        }
                    }

                    currentTimes++
                }

                const nodeRadius = 18
                for (let i = 0; i < inputs.length; i++) {
                    const x = Visualizer.getNodeX(inputs, i, left, right)
                    ctx.beginPath()
                    ctx.arc(x, bottom, nodeRadius * 0.8, 0, Math.PI * 2)
                    ctx.strokeStyle = 'white'
                    ctx.lineWidth = 2
                    ctx.stroke()
                    ctx.fillStyle = "black"
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2)
                    ctx.fillStyle = getRGBA(inputs[i])
                    ctx.fill()
                }

                for (let i = 0; i < outputs.length; i++) {
                    const x = Visualizer.getNodeX(outputs, i, left, right)
                    ctx.beginPath()
                    ctx.arc(x, top, nodeRadius, 0, Math.PI * 2)
                    ctx.fillStyle = "black"
                    ctx.fill()
                    ctx.beginPath()
                    ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2)
                    ctx.fillStyle = getRGBA(outputs[i])
                    ctx.fill()

                    ctx.beginPath()
                    ctx.lineWidth = 2
                    ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2)
                    ctx.strokeStyle = getRGBA(biases[i])
                    ctx.stroke()

                    if (outputLabels[i]) {
                        ctx.beginPath()
                        ctx.textAlign = "center"
                        ctx.textBaseline = "middle"
                        ctx.fillStyle = "black"
                        ctx.strokeStyle = "white"
                        ctx.font = (nodeRadius * 1.5) + "px Arial"
                        ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1)
                        ctx.lineWidth = 0.5
                        ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1)
                    }
                }
            }

            static getNodeX(nodes,index,left,right){
                return lerp(left, right, nodes.length == 1 ? 0.5 : index / (nodes.length - 1))
            }
        }

        function getRGBA(value){
            const alpha = Math.abs(value)
            const R = value < 0 ? 0 : 255
            const G = value < 0 ? 0 : 255
            const B = value < 0 ? 0 : 255
            return "rgba("+R+","+G+","+B+","+alpha+")"
        }


        class Character {
            constructor(x, y, width, height, scale = 1, imageSrc, frameCount, frameRate, offsetX = 0, offsetY = 0, hitboxOffsetX = 0, hitboxOffsetY = 0, brain = new NeuralNetwork([7, 10, 4])) {
                this.x = x + offsetX
                this.y = y + offsetY
                this.width = width
                this.height = height
                this.scale = scale
                this.offsetX = offsetX
                this.offsetY = offsetY
                this.hitboxOffsetX = hitboxOffsetX
                this.hitboxOffsetY = hitboxOffsetY
                this.velY = 0
                this.velX = 0
                this.onGround = true
                this.image = new Image()
                this.image.src = imageSrc
                this.imageLoaded = false;
                this.image.addEventListener('load', () => {
                  this.imageLoaded = true;
                });
                this.frameCount = frameCount // total number of frames in the sprite sheet
                this.frameWidth = this.image.width / frameCount // frame width within the sprite sheet
                this.frameHeight = this.image.height // frame height within the sprite sheet
                this.frameRate = frameRate // animation frame rate
                this.frameIndex = 0 // current frame to be displayed
                this.frameTimer = 0 // timer to control the frame rate
                this.currentJumps = 0
                this.hitbox = {
                    x: this.x + this.hitboxOffsetX,
                    y: this.y + this.hitboxOffsetY,
                    width: 70,
                    height: 100
                }

                this.brain = brain
                this.distance = 0
                this.completed = false
            }

            moveLeft() {
                this.velX = 0
                if (this.x + this.width + this.velX < 100) {
                    this.velX = 0
                }
                else this.velX = -2
            }

            moveRight() {
                this.velX = 0
                if (this.x + this.width + this.velX >= gameCanvas.width - 10) {
                    this.velX = 0
                }
                else this.velX = 2
            }

            jump() {
                if (this.currentJumps == 0) {
                    this.velY = -10
                    this.currentJumps++
                }
            }

            duck() {
                if (this.y + this.height + this.velY < gameCanvas.height - 88) {
                    this.velY = 4
                }
            }

            drawSensors(obstacles) {
                const rayLength = 400;
                const rayColor = 'white'
                const rayFill = 'black'

                const startX = this.x + this.hitboxOffsetX + this.hitbox.width / 2
                const startY = this.y + this.hitboxOffsetY + this.hitbox.height / 2

                let rayLengthsNormalized = []

                for (let angle = -180; angle <= 0; angle += 30) {
                    const radians = angle * (Math.PI / 180)
                    const endX = startX + rayLength * Math.cos(radians)
                    const endY = startY - rayLength * Math.sin(radians)

                    let closestIntersection = null
                    let closestDistance = Infinity

                    for (const obstacle of obstacles) {
                        const intersection = rayObstacleIntersection(startX, startY, endX, endY, obstacle)
                        if (intersection && intersection.distance < closestDistance) {
                            closestDistance = intersection.distance
                            closestIntersection = intersection
                        }
                    }

                    gameCtx.strokeStyle = rayColor
                    gameCtx.lineWidth = 2
                    gameCtx.beginPath()
                    gameCtx.moveTo(startX, startY)
                    gameCtx.lineTo(endX, endY)
                    gameCtx.stroke()

                    if (closestIntersection) {
                        gameCtx.strokeStyle = rayFill
                        gameCtx.lineWidth = 2
                        gameCtx.beginPath()
                        gameCtx.moveTo(endX, endY)
                        gameCtx.lineTo(closestIntersection.x, closestIntersection.y)
                        gameCtx.stroke()

                        // Normalize the ray length and add it to the array
                        rayLengthsNormalized.push(1 - (closestDistance / rayLength))
                    } else {
                        rayLengthsNormalized.push(0)
                    }
                }

                return rayLengthsNormalized;
            }

            draw() {
                if (this.imageLoaded) {
                    gameCtx.drawImage(
                        this.image,
                        this.frameIndex * this.frameWidth,
                        0,
                        this.frameWidth,
                        this.frameHeight,
                        this.x,
                        this.y,
                        this.frameWidth * this.scale,
                        this.frameHeight * this.scale
                    )
                }

                // draw hitbox
                gameCtx.strokeStyle = 'red'
                gameCtx.lineWidth = 2
                gameCtx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

                // Update the frame timer and index
                this.frameTimer++
                if (this.frameTimer >= this.frameRate) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount
                    this.frameTimer = 0
                }
            }

            update() {
                if (!this.onGround) {
                    this.velY += gravity
                }

                this.x += this.velX
                this.y += this.velY

                if (this.y + this.height > gameCanvas.height - 82) {
                    this.y = (gameCanvas.height - 82) - this.height
                    this.velY = 0
                    this.onGround = true
                    this.currentJumps = 0
                }
                else this.onGround = false

                // Update hitbox
                this.hitbox.x = this.x + this.hitboxOffsetX
                this.hitbox.y = this.y + this.hitboxOffsetY
            }
        }

        function liangBarskyIntersection(x0, y0, x1, y1, left, top, right, bottom) {
            const dx = x1 - x0
            const dy = y1 - y0
            const p = [-dx, dx, -dy, dy]
            const q = [x0 - left, right - x0, y0 - top, bottom - y0]
            const u = [0, 1]

            for (let i = 0; i < 4; i++) {
                if (p[i] === 0) {
                    if (q[i] < 0) return null
                } else {
                    const t = q[i] / p[i]
                    if (p[i] < 0 && u[0] < t) u[0] = t
                    else if (p[i] > 0 && u[1] > t) u[1] = t
                    if (u[0] > u[1]) return null
                }
            }

            return {
                x: x0 + u[0] * dx,
                y: y0 + u[0] * dy,
                distance: Math.sqrt(Math.pow(u[0] * dx, 2) + Math.pow(u[0] * dy, 2)),
            }
        }

        function rayObstacleIntersection(x0, y0, x1, y1, obstacle) {
            const left = obstacle.hitbox.x
            const top = obstacle.hitbox.y
            const right = obstacle.hitbox.x + obstacle.hitbox.width
            const bottom = obstacle.hitbox.y + obstacle.hitbox.height

            return liangBarskyIntersection(x0, y0, x1, y1, left, top, right, bottom)
        }

        function lerp(a, b, t) {
            return a + (b - a) * t
        }

        class Obstacle {
            constructor(x, y, width, height, scale = 1, imageSrc, frameCount, frameRate, offsetX = 0, offsetY = 0, hitboxOffsetX = 0, hitboxOffsetY = 0) {
                this.x = x + offsetX
                this.y = y + offsetY
                this.width = width
                this.height = height
                this.scale = scale
                this.offsetX = offsetX
                this.offsetY = offsetY
                this.hitboxOffsetX = hitboxOffsetX
                this.hitboxOffsetY = hitboxOffsetY
                this.velY = 0
                this.velX = 0
                this.image = new Image()
                this.image.src = imageSrc
                this.frameCount = frameCount // total number of frames in the sprite sheet
                this.frameWidth = this.image.width / frameCount // frame width within the sprite sheet
                this.frameHeight = this.image.height // frame height within the sprite sheet
                this.frameRate = frameRate // animation frame rate
                this.frameIndex = 0 // current frame to be displayed
                this.frameTimer = 0 // timer to control the frame rate
                this.hitbox = {
                    x: this.x + this.hitboxOffsetX,
                    y: this.y + this.hitboxOffsetY,
                    width: 35,
                    height: 50
                }
            }

            draw() {
                gameCtx.drawImage(
                    this.image,
                    this.frameIndex * this.frameWidth,
                    0,
                    this.frameWidth,
                    this.frameHeight,
                    this.x,
                    this.y,
                    this.frameWidth * this.scale,
                    this.frameHeight * this.scale
                )

                // draw hitbox
                gameCtx.strokeStyle = 'red'
                gameCtx.lineWidth = 2
                gameCtx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

                // Update the frame timer and index
                this.frameTimer++
                if (this.frameTimer >= this.frameRate) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount
                    this.frameTimer = 0
                }
            }

            update() {
                this.x -= 1.4

                if (this.x + this.width < 0) {
                    // this.x = canvas.width
                    // this.height = Math.floor(Math.random() * 100) + 50
                    this.height = 50
                    this.y = gameCanvas.height - this.height
                }

                // Update hitbox
                this.hitbox.x = this.x + this.hitboxOffsetX
                this.hitbox.y = this.y + this.hitboxOffsetY
            }
        }

        let obstacles = []

        class Population {
            constructor(size, characterTemplate, ratio1 = 0.6, ratio2 = 0.3) {
                this.size = size
                this.characterTemplate = characterTemplate
                this.characters = []
                this.ratio1 = ratio1
                this.ratio2 = ratio2

                this.createInitialPopulation()
            }

            storeBestNeuralNetwork() {
                const bestCharacter = this.findBestCharacter()
                const storedMaxDistance = localStorage.getItem('maxDistance')
                console.log(bestCharacter.distance)

                // If there is no stored max distance or the current best character's distance is greater, update localStorage
                if (!storedMaxDistance || bestCharacter.distance > parseInt(storedMaxDistance, 10)) {
                    localStorage.setItem('maxDistance', bestCharacter.distance.toString())
                    localStorage.setItem('bestNeuralNetwork', JSON.stringify(bestCharacter.brain, (_, value) => {
                        return typeof value === 'function' ? value.toString() : value
                    }))
                }
            }

            createInitialPopulation() {
                const storedBestNeuralNetwork = localStorage.getItem('bestNeuralNetwork')

                if (storedBestNeuralNetwork) {
                    const bestBrain = JSON.parse(storedBestNeuralNetwork, (_, value) => {
                        return typeof value === 'string' && value.startsWith('function') ?
                            Function.call(null, `return ${value}`)() : value
                    });

                    const bestCharacter = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, bestBrain)
                    this.characters.push(bestCharacter)

                    const count1 = Math.floor(this.size * this.ratio1)
                    const count2 = Math.floor(this.size * this.ratio2)

                    // Create count1 mutants of the stored best brain with 0.2 mutation rate
                    for (let i = 1; i <= count1; i++) {
                        const mutatedBrain = JSON.parse(JSON.stringify(bestBrain))
                        NeuralNetwork.mutate(mutatedBrain, 0.2)
                        const character = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, mutatedBrain)
                        this.characters.push(character)
                    }

                    // Create count2 mutants of the stored best brain with 0.3 mutation rate
                    for (let i = count1 + 1; i <= count1 + count2; i++) {
                        const mutatedBrain = JSON.parse(JSON.stringify(bestBrain))
                        NeuralNetwork.mutate(mutatedBrain, 0.3)
                        const character = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, mutatedBrain)
                        this.characters.push(character)
                    }

                    // Create count3 mutants of the stored best brain with a different mutation rate (e.g., 0.6)
                    for (let i = count1 + count2 + 1; i < this.size; i++) {
                        const mutatedBrain = JSON.parse(JSON.stringify(bestBrain))
                        NeuralNetwork.mutate(mutatedBrain, 0.6)
                        const character = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, mutatedBrain)
                        this.characters.push(character)
                    }
                }
                else {
                    for (let i = 0; i < this.size; i++) {
                        const character = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
                        this.characters.push(character)
                    }
                }
            }

            findBestCharacter() {
                let bestCharacter = this.characters[0]
                for (const character of this.characters) {
                    if (character.distance > bestCharacter.distance) {
                        bestCharacter = character
                    }
                }
                return bestCharacter
            }

            createNextGeneration() {
                const storedBestNeuralNetwork = localStorage.getItem('bestNeuralNetwork')

                const bestBrain = JSON.parse(storedBestNeuralNetwork, (_, value) => {
                    return typeof value === 'string' && value.startsWith('function') ?
                        Function.call(null, `return ${value}`)() : value
                })

                const bestCharacter = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, bestBrain)
                this.characters[0] = bestCharacter

                const count1 = Math.floor(this.size * this.ratio1)
                const count2 = Math.floor(this.size * this.ratio2)

                // Create count1 mutants of the stored best brain with 0.2 mutation rate
                for (let i = 1; i <= count1; i++) {
                    const newBrain = JSON.parse(JSON.stringify(bestCharacter.brain))
                    NeuralNetwork.mutate(newBrain, 0.2)
                    this.characters[i] = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, newBrain)
                }

                // Create count2 mutants of the stored best brain with 0.3 mutation rate
                for (let i = count1 + 1; i <= count1 + count2; i++) {
                    const newBrain = JSON.parse(JSON.stringify(bestCharacter.brain))
                    NeuralNetwork.mutate(newBrain, 0.3)
                    this.characters[i] = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, newBrain)
                }

                // Create count3 mutants of the stored best brain with a different mutation rate (e.g., 0.6)
                for (let i = count1 + count2 + 1; i < this.size; i++) {
                    const newBrain = JSON.parse(JSON.stringify(bestCharacter.brain))
                    NeuralNetwork.mutate(newBrain, 0.6)
                    this.characters[i] = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, newBrain)
                }
            }
        }


        const n = 100

        runGenerations(5)

        async function runGenerations(generations) {
            const characterTemplate = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
            const population = new Population(n, characterTemplate, 0.6, 0.3)

            for (let generation = 0; generation < generations; generation++) {
                resetGameState()
                console.log("Generation:", generation)
                await gameLoop(population)
            }
        }

        async function gameLoop(population) {
            resetGameState()
            console.log("Running characters:", population.characters.map((c, i) => `Character ${i}: ${c.brain.levels[1].biases}`))
            await runCharacters(population.characters)

            population.storeBestNeuralNetwork()
            population.createNextGeneration()
        }

        function runCharacters(characters) {
            return new Promise((resolve) => {
                const completedCharacters = [];

                function loop() {
                    background.update();

                    characters.forEach((character, index) => {
                        if (!character.completed) {
                            character.draw();
                            const rayData = character.drawSensors(obstacles).map((s) => (s === null ? 0 : s));
                            character.update();

                            // Visualizer.drawNetwork(visualizerCtx, character.brain);

                            character.velX = 0;

                            const outputs = NeuralNetwork.feedForward(rayData, character.brain);

                            if (outputs[0] === 1) {
                                character.moveLeft();
                            }
                            if (outputs[1] === 1) {
                                character.jump();
                            }
                            if (outputs[2] === 1) {
                                character.moveRight();
                            }
                            if (outputs[3] === 1) {
                                character.duck();
                            }

                            character.distance++;
                        }
                    });

                    if (
                        obstacles.length === 0 ||
                        (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) <
                        gameCanvas.width - (Math.floor(Math.random() * 300) + 100)
                    ) {
                        createObstacle();
                    }

                    for (const [index, obstacle] of obstacles.entries()) {
                        obstacle.draw();
                        obstacle.update();

                        characters.forEach((character, i) => {
                            if (
                                !character.completed &&
                                character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                                character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                                character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                                character.hitbox.y + character.hitbox.height > obstacle.hitbox.y
                            ) {
                                // Collision detected
                                character.completed = true;
                                completedCharacters.push(character);
                            }
                        });

                        if (obstacle.x + obstacle.width < 0) {
                            obstacles.splice(index, 1);
                        }
                    }

                    if (completedCharacters.length < characters.length && characters.every(char => char.distance <= 20000)) {
                        requestAnimationFrame(loop);
                    } else {
                        requestAnimationFrame(() => resolve(completedCharacters));
                    }
                }

                loop();
            });
        }


        function createObstacle() {
            const minWidth = 150;
            const maxWidth = minWidth + 100; // Adjust this value to control the maximum distance between obstacles
            const x = gameCanvas.width + (Math.floor(Math.random() * 150)) + minWidth
            const y = gameCanvas.height - 166;
            const width = 50;
            const height = 50;
            const obstacle = new Obstacle(x, y, width, height, 2.4, fire, 8, 12, 0, 0, 12, 26);
            obstacles.push(obstacle);
        }

        function resetGameState() {
            obstacles = []
        }

        class Floor {
            constructor({ position, velocity, imageSrc }) {
                this.position = position
                this.height = 150
                this.width = 50
                this.image = new Image()
                this.image.src = imageSrc
                this.velocity = velocity
            }

            draw() {
                gameCtx.drawImage(this.image, this.position.x, this.position.y)
            }

            update() {
                this.position.x += this.velocity.x
                if (this.position.x < -72) this.position.x = 1024
                this.draw()
            }
        }

        let mainFloorsArr = []
        let xPosition1 = 954

        for (let i = 0; i < 16; i++) {
            mainFloorsArr.push(new Floor({
                position: {
                    x: xPosition1,
                    y: 486
                },
                velocity: {
                    x: -1.4,
                    y: 0
                },
                imageSrc: floor1
            }))

            xPosition1 -= 71
        }

        let subFloorsArr = []
        let xPosition2 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr.push(new Floor({
                position: {
                    x: xPosition2,
                    y: 552
                },
                velocity: {
                    x: -1.4,
                    y: 0
                },
                imageSrc: floor2
            }))

            xPosition2 -= 71
        }

        let subFloorsArr2 = []
        let xPosition3 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr2.push(new Floor({
                position: {
                    x: xPosition3,
                    y: 530
                },
                velocity: {
                    x: -1.4,
                    y: 0
                },
                imageSrc: floor2
            }))

            xPosition3 -= 71
        }

        let subFloorsArr3 = []
        let xPosition4 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr3.push(new Floor({
                position: {
                    x: xPosition4,
                    y: 508
                },
                velocity: {
                    x: -1.4,
                    y: 0
                },
                imageSrc: floor2
            }))

            xPosition4 -= 71
        }


        function drawFloor() {
            window.requestAnimationFrame(drawFloor)
            for (let i = 0; i < mainFloorsArr.length; i++) {
                let floor = mainFloorsArr[i]
                floor.update()
            }

            for (let i = 0; i < subFloorsArr.length; i++) {
                let floor = subFloorsArr[i]
                floor.update()
            }

            for (let i = 0; i < subFloorsArr2.length; i++) {
                let floor = subFloorsArr2[i]
                floor.update()
            }

            for (let i = 0; i < subFloorsArr3.length; i++) {
                let floor = subFloorsArr3[i]
                floor.update()
            }
        }

        drawFloor()

        // window.addEventListener('keydown', (event) => {
        //     switch (event.key) {
        //         case 'a':
        //             keys.a.pressed = true
        //             lastKey = 'a'
        //             break
        //         case 'd':
        //             keys.d.pressed = true
        //             lastKey = 'd'
        //             break
        //         case 'w':
        //             character.jump()
        //             break
        //         case 's':
        //             character.duck()
        //             break
        //         case 'A':
        //             keys.a.pressed = true
        //             lastKey = 'a'
        //             break
        //         case 'D':
        //             keys.d.pressed = true
        //             lastKey = 'd'
        //             break
        //         case 'W':
        //             character.jump()
        //             break
        //         case 'S':
        //             character.duck()
        //             break
        //         case 'ArrowLeft':
        //             keys.a.pressed = true
        //             lastKey = 'a'
        //             break
        //         case 'ArrowRight':
        //             keys.d.pressed = true
        //             lastKey = 'd'
        //             break
        //         case 'ArrowUp':
        //             character.jump()
        //             break
        //         case 'ArrowDown':
        //             character.duck()
        //             break
        //     }
        // })

        // window.addEventListener('keyup', (event) => {
        //     switch (event.key) {
        //         case 'a':
        //             keys.a.pressed = false
        //             break
        //         case 'd':
        //             keys.d.pressed = false
        //             break
        //         case 'A':
        //             keys.a.pressed = false
        //             break
        //         case 'D':
        //             keys.d.pressed = false
        //             break
        //         case 'ArrowLeft':
        //             keys.a.pressed = false
        //             break
        //         case 'ArrowRight':
        //             keys.d.pressed = false
        //             break
        //     }
        // })

        // {
        //     "levels": [
        //         {
        //             "inputs": [
        //                 0.9119999999999655,
        //                 0.898386352622586,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0
        //             ],
        //             "outputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 1,
        //                 1,
        //                 1,
        //                 0,
        //                 0,
        //                 1,
        //                 0
        //             ],
        //             "biases": [
        //                 0.19499369061131913,
        //                 -0.3230307281710343,
        //                 0.4460915702098062,
        //                 0.17541472904014682,
        //                 -0.535494779489864,
        //                 0.050484408357885494,
        //                 0.4830296805484102,
        //                 0.25143911960945714,
        //                 -0.5364719225988441,
        //                 0.6087904003401184
        //             ],
        //             "weights": [
        //                 [
        //                     -0.2668200641178492,
        //                     -0.443604197583623,
        //                     -0.006455777852001243,
        //                     -0.16338989755168593,
        //                     0.10707128413022585,
        //                     -0.1796906855080594,
        //                     0.5707465757705739,
        //                     -0.24963526729237828,
        //                     -0.034338426807018804,
        //                     -0.26298383534879766
        //                 ],
        //                 [
        //                     0.45852528566932343,
        //                     -0.37452069283844136,
        //                     0.009034650688348106,
        //                     0.3998293477226139,
        //                     -0.3282823369303201,
        //                     0.37008042966152593,
        //                     -0.16748549090307646,
        //                     0.14720694668231715,
        //                     -0.29322182498222793,
        //                     0.39525702048575667
        //                 ],
        //                 [
        //                     -0.18844825676091825,
        //                     -0.3572826275158981,
        //                     0.15683457030186337,
        //                     -0.2790672061574075,
        //                     -0.2314499103620161,
        //                     -0.5592462837107174,
        //                     0.8199147357884751,
        //                     0.014934790232433937,
        //                     -0.2506827318741981,
        //                     0.14897233626191864
        //                 ],
        //                 [
        //                     -0.22260057478471618,
        //                     0.3213365870440174,
        //                     0.14225499855500864,
        //                     -0.14583724254546562,
        //                     -0.18835480115525918,
        //                     -0.011931423995001217,
        //                     -0.18634439200770955,
        //                     0.04309549776099739,
        //                     -0.08905442407795117,
        //                     0.19829613598454032
        //                 ],
        //                 [
        //                     -0.24762518905573133,
        //                     0.04409662121309821,
        //                     -0.015996159949572986,
        //                     -0.3030776594349621,
        //                     0.36815554442851245,
        //                     -0.1875638713588638,
        //                     -0.16730179603812487,
        //                     -0.002845072819658734,
        //                     0.2917797388564038,
        //                     -0.26307241611333143
        //                 ],
        //                 [
        //                     0.7438993675143311,
        //                     -0.615233697134638,
        //                     -0.32111883620468273,
        //                     0.09447499647725745,
        //                     -0.2337358068192513,
        //                     -0.11830343261003695,
        //                     0.4848688819163784,
        //                     0.3012716439627132,
        //                     -0.21200868354425206,
        //                     0.602463718854519
        //                 ],
        //                 [
        //                     -0.19561685812511462,
        //                     0.3074046906379527,
        //                     -0.09222065345284267,
        //                     -0.1676291130048358,
        //                     -0.18967600024551368,
        //                     -0.42430058092865885,
        //                     0.48206625380187695,
        //                     0.7445666008227294,
        //                     0.12188383452120558,
        //                     -0.27408317608624594
        //                 ]
        //             ]
        //         },
        //         {
        //             "inputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 1,
        //                 1,
        //                 1,
        //                 0,
        //                 0,
        //                 1,
        //                 0
        //             ],
        //             "outputs": [
        //                 1,
        //                 0,
        //                 0,
        //                 0
        //             ],
        //             "biases": [
        //                 -0.1908862208472119,
        //                 0.45266112643182793,
        //                 0.4655953448426199,
        //                 0.0942535838030894
        //             ],
        //             "weights": [
        //                 [
        //                     -0.3415543972873495,
        //                     0.09727541920175439,
        //                     -0.7427374168665518,
        //                     -0.6806350633821296
        //                 ],
        //                 [
        //                     0.05846135718284293,
        //                     0.41822949690191424,
        //                     0.4023250778788061,
        //                     -0.15775853782337237
        //                 ],
        //                 [
        //                     0.27860088349370915,
        //                     0.27189412920184575,
        //                     0.5758417079551525,
        //                     0.050049500888839055
        //                 ],
        //                 [
        //                     0.009717168781794627,
        //                     0.30294587843128545,
        //                     -0.23140011522961554,
        //                     -0.39764462775242854
        //                 ],
        //                 [
        //                     0.06339596405198861,
        //                     -0.09998162404962763,
        //                     0.3857406722453339,
        //                     -0.2557378117506326
        //                 ],
        //                 [
        //                     -0.18849296189473447,
        //                     -0.20002767332993177,
        //                     0.024535978883442444,
        //                     -0.7072943175880984
        //                 ],
        //                 [
        //                     0.3755291111443591,
        //                     -0.3448731427468356,
        //                     0.1794105180564143,
        //                     -0.04514725532470733
        //                 ],
        //                 [
        //                     -0.05815818549981014,
        //                     0.49989297611740086,
        //                     0.297032410023358,
        //                     0.5335918997810365
        //                 ],
        //                 [
        //                     -0.03702541574592777,
        //                     -0.04204166142857946,
        //                     0.08806120956913142,
        //                     0.30243735082996137
        //                 ],
        //                 [
        //                     0.17646048218239388,
        //                     -0.2724739025948478,
        //                     -0.21865183764120782,
        //                     0.4659198278100944
        //                 ]
        //             ]
        //         }
        //     ]
        // }
    }, [])


    return (
        <div className="gameCanvasContainer">
            <canvas id="gameCanvas" ref={gameCanvasRef}/>
            <canvas id="visualizerCanvas" ref={visualizerCanvasRef}/>
        </div>
    )
}

export default GameCanvas
