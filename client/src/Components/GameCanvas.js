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
            constructor(x, y, width, height, scale = 1, imageSrc, frameCount, frameRate, offsetX = 0, offsetY = 0, hitboxOffsetX = 0, hitboxOffsetY = 0, brain = new NeuralNetwork([13, 10, 4])) {
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
                    height: this.frameHeight
                }

                this.brain = brain
                this.distance = 0
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

                for (let angle = -180; angle <= 0; angle += 15) {
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
                        rayLengthsNormalized.push(1 - (closestDistance / rayLength));
                    } else {
                        rayLengthsNormalized.push(0);
                    }
                }

                return rayLengthsNormalized;
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
            constructor(size, characterTemplate) {
                this.size = size
                this.characterTemplate = characterTemplate
                this.characters = []

                this.createInitialPopulation()
            }

            storeBestNeuralNetwork() {
                const bestCharacter = this.findBestCharacter();
                const storedMaxDistance = localStorage.getItem('maxDistance');

                // If there is no stored max distance or the current best character's distance is greater, update localStorage
                if (!storedMaxDistance || bestCharacter.distance > parseInt(storedMaxDistance, 10)) {
                    localStorage.setItem('maxDistance', bestCharacter.distance.toString())
                    localStorage.setItem('bestNeuralNetwork', JSON.stringify(bestCharacter.brain, (_, value) => {
                        return typeof value === 'function' ? value.toString() : value
                    }))
                }
            }

            createInitialPopulation() {
                const storedBestNeuralNetwork = localStorage.getItem('bestNeuralNetwork');

                if (storedBestNeuralNetwork) {
                    const bestBrain = JSON.parse(storedBestNeuralNetwork, (_, value) => {
                        return typeof value === 'string' && value.startsWith('function') ?
                            Function.call(null, `return ${value}`)() : value
                    })

                    const bestCharacter = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, bestBrain)
                    this.characters.push(bestCharacter)

                    for (let i = 1; i < this.size; i++) {
                        const mutatedBrain = JSON.parse(JSON.stringify(bestBrain))
                        NeuralNetwork.mutate(mutatedBrain, 0.2)
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
                let bestCharacter = this.characters[0];
                for (const character of this.characters) {
                    if (character.distance > bestCharacter.distance) {
                        bestCharacter = character
                    }
                }
                return bestCharacter
            }

            createNextGeneration() {
                const bestCharacter = this.findBestCharacter()
                const newCharacters = [bestCharacter]

                for (let i = 1; i < this.size; i++) {
                    const newBrain = JSON.parse(JSON.stringify(bestCharacter.brain))
                    NeuralNetwork.mutate(newBrain, 0.2)
                    newCharacters.push(new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0, newBrain))
                }

                this.characters = newCharacters
            }
        }

        async function gameLoop(population) {
            for (let i = 0; i < population.characters.length; i++) {
                let character = population.characters[i]

                resetGameState()
                console.log("   Character", i + ": ", character.brain.levels[1].biases)
                await runCharacter(character)
            }
            population.storeBestNeuralNetwork()
            population.createNextGeneration()
        }


        async function runGenerations(generations) {
            const characterTemplate = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
            const population = new Population(10, characterTemplate)

            for (let generation = 0; generation < generations; generation++) {
                console.log("Generation:", generation)
                await gameLoop(population)
            }
        }

        runGenerations(10)

        function runCharacter(character) {
            return new Promise((resolve) => {
                function loop() {
                    background.update()

                    character.draw()
                    const rayData = character.drawSensors(obstacles).map((s) => (s === null ? 0 : s))
                    character.update()

                    Visualizer.drawNetwork(visualizerCtx, character.brain)

                    character.velX = 0

                    const outputs = NeuralNetwork.feedForward(rayData, character.brain)

                    if (outputs[0] === 1) {
                        character.moveLeft()
                    }
                    if (outputs[1] === 1) {
                        character.jump()
                    }
                    if (outputs[2] === 1) {
                        character.moveRight()
                    }
                    if (outputs[3] === 1) {
                        character.duck()
                    }


                    if (
                        obstacles.length === 0 ||
                        (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) <
                        gameCanvas.width - (Math.floor(Math.random() * 300) + 100)
                    ) {
                        createObstacle()
                    }

                    let collisionDetected = false

                    for (const [index, obstacle] of obstacles.entries()) {
                        obstacle.draw()
                        obstacle.update()

                        if (
                            character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                            character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                            character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                            character.hitbox.y + character.hitbox.height > obstacle.hitbox.y
                        ) {
                            // Collision detected
                            collisionDetected = true
                            break
                        }

                        if (obstacle.x + obstacle.width < 0) {
                            obstacles.splice(index, 1)
                        }
                    }

                    if (!collisionDetected && character.distance <= 10000) {
                        requestAnimationFrame(loop)
                    }
                    else {
                        requestAnimationFrame(() => resolve(character))
                    }

                    character.distance++
                }

                loop()
            });
        }

        function createObstacle() {
            const minWidth = 150;
            const maxWidth = minWidth + 100; // Adjust this value to control the maximum distance between obstacles
            const x = gameCanvas.width + Math.random() * ((maxWidth - minWidth) + minWidth);
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

        //   {
        //     "levels": [
        //         {
        //             "inputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 0.8179200038444633,
        //                 0.8513323056836708,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0.5025481994611276,
        //                 0
        //             ],
        //             "outputs": [
        //                 1,
        //                 0,
        //                 0,
        //                 1,
        //                 0,
        //                 1,
        //                 1,
        //                 0,
        //                 1,
        //                 1
        //             ],
        //             "biases": [
        //                 -0.5187126559108288,
        //                 0.4336440443887127,
        //                 0.7286508897278111,
        //                 -0.47685634754543693,
        //                 -0.03708091157757326,
        //                 0.43920511278880003,
        //                 -0.6181612052010678,
        //                 -0.32457357728804614,
        //                 -0.31822760420554996,
        //                 0.520270958991225
        //             ],
        //             "weights": [
        //                 [
        //                     -0.8487542202452489,
        //                     0.39652639217417224,
        //                     -0.7997488675106045,
        //                     -0.05243088622892042,
        //                     0.5684035307690205,
        //                     -0.3418127924590161,
        //                     0.9778155616359216,
        //                     -0.2679672415241899,
        //                     -0.6955876012765729,
        //                     -0.6067770501118745
        //                 ],
        //                 [
        //                     0.7756170160306637,
        //                     0.17574875792362102,
        //                     -0.8614338829817676,
        //                     -0.20630777555940616,
        //                     -0.5045981369391008,
        //                     0.8962496024270193,
        //                     -0.5898579374285636,
        //                     -0.406757604904905,
        //                     -0.2552951862234134,
        //                     -0.014755517363155779
        //                 ],
        //                 [
        //                     0.6783110779182231,
        //                     -0.06735090888322395,
        //                     -0.2092353119850908,
        //                     0.7767512517384276,
        //                     0.46197450387923167,
        //                     0.28276385159785616,
        //                     0.1027869328822418,
        //                     0.09782363514942158,
        //                     0.10155109123302895,
        //                     -0.6220060446879592
        //                 ],
        //                 [
        //                     0.053086771287503165,
        //                     0.8885889186520559,
        //                     -0.272844503096778,
        //                     0.027295208090670806,
        //                     -0.12860968592997002,
        //                     0.1215309784968226,
        //                     0.4658086243467537,
        //                     -0.3453314946737797,
        //                     -0.133663126138045,
        //                     -0.15818893561578198
        //                 ],
        //                 [
        //                     -0.37086927865845504,
        //                     -0.31513343189989146,
        //                     -0.6572306765847686,
        //                     -0.46476513515354917,
        //                     -0.7913829001301431,
        //                     0.7284349745635572,
        //                     -0.8443681321895327,
        //                     -0.6955648206199814,
        //                     0.4951601610578451,
        //                     0.5585137476570667
        //                 ],
        //                 [
        //                     0.16008780875464534,
        //                         -0.007401633117357597,
        //                         0.6757079458346262,
        //                         0.3423284099724773,
        //                         0.23611499438552075,
        //                         -0.12930385984248474,
        //                         0.5716078601685869,
        //                         -0.32468577814278204,
        //                         0.8067758966368439,
        //                         -0.7002121842739958
        //                     ],
        //                     [
        //                         -0.2332260916460445,
        //                         -0.06263512390657544,
        //                         0.728922645528878,
        //                         0.24946404038915626,
        //                         0.1716922120716604,
        //                         -0.05291589799242438,
        //                         -0.5354181067380569,
        //                         0.355332398530933,
        //                         0.7948280681047861,
        //                         -0.8602541676424378
        //                     ],
        //                     [
        //                         -0.46097537880245687,
        //                         -0.5151461142863507,
        //                         0.006152302871391346,
        //                         0.22778321285214254,
        //                         0.4386603859841712,
        //                         -0.09337768271440713,
        //                         0.5438915323268223,
        //                         0.14602035954494397,
        //                         0.8079767832027912,
        //                         -0.3835462991303419
        //                     ],
        //                     [
        //                         -0.37988631967375736,
        //                         -0.23566280469191872,
        //                         0.5938992900132646,
        //                         0.058066034354769314,
        //                         -0.0013979122955328493,
        //                         0.5020467740523233,
        //                         -0.21053788516050498,
        //                         0.4573808254644677,
        //                         0.8911022388815644,
        //                         0.5807131778621379
        //                     ],
        //                     [
        //                         -0.2777327022381489,
        //                         -0.7473184993245492,
        //                         -0.1793716768287612,
        //                         0.469431856748623,
        //                         0.2668190590833567,
        //                         -0.45576594282500094,
        //                         -0.1272109318774076,
        //                         -0.6041859157638865,
        //                         -0.11674676527270283,
        //                         -0.21591691565004165
        //                     ],
        //                     [
        //                         -0.04115773780571681,
        //                         0.4455485711247632,
        //                         0.4887044318622431,
        //                         0.6375151987828588,
        //                         -0.45776841096778986,
        //                         0.4580508366476699,
        //                         -0.29158854679933344,
        //                         -0.14753062605145617,
        //                         -0.3127148530196574,
        //                         -0.8246790547702227
        //                     ],
        //                     [
        //                         -0.4478080500310046,
        //                         -0.6967701651124579,
        //                         -0.4879558267012006,
        //                         0.10226799041529197,
        //                         -0.08924819449727597,
        //                         0.3187035043476804,
        //                         0.6605296333937545,
        //                         -0.5259014431081542,
        //                         0.4947929674737936,
        //                         0.8615828267488471
        //                     ],
        //                     [
        //                         0.2549620839968913,
        //                         0.3271820465816778,
        //                         0.5382086582338949,
        //                         -0.04796601112921381,
        //                         0.4863873817886509,
        //                         0.8440370527993019,
        //                         -0.23773229501744114,
        //                         -0.4003177532057307,
        //                         0.21007577892361695,
        //                         -0.2364642900399719
        //                     ]
        //                 ]
        //             },
        //             {
        //                 "inputs": [
        //                     1,
        //                     0,
        //                     0,
        //                     1,
        //                     0,
        //                     1,
        //                     1,
        //                     0,
        //                     1,
        //                     1
        //                 ],
        //                 "outputs": [
        //                     1,
        //                     1,
        //                     1,
        //                     0
        //                 ],
        //                 "biases": [
        //                     -0.5766329227257196,
        //                     -0.8297216633211455,
        //                     -0.1444109313009232,
        //                     0.6702476360068601
        //                 ],
        //                 "weights": [
        //                     [
        //                         0.30398547100072193,
        //                         -0.7665039035506507,
        //                         0.21328329654336828,
        //                         0.14525310531671798
        //                     ],
        //                     [
        //                         0.296707152692418,
        //                         -0.44237862978626896,
        //                         -0.2952875685477292,
        //                         0.3590575222741884
        //                     ],
        //                     [
        //                         0.3584022017545518,
        //                         0.6240202314049543,
        //                         -0.7396743169791866,
        //                         -0.6005203138424914
        //                     ],
        //                     [
        //                         0.5339111531138043,
        //                         0.7013374304937654,
        //                         -0.38108141330102174,
        //                         -0.13016617886234777
        //                     ],
        //                     [
        //                         -0.4647731439243742,
        //                         -0.5320280269272197,
        //                         -0.8476267976805758,
        //                         0.6684147217758643
        //                     ],
        //                     [
        //                         -0.3927056523786825,
        //                         -0.957184364552039,
        //                         0.19885219912325905,
        //                         0.5812004894633551
        //                     ],
        //                     [
        //                         0.7701128409980502,
        //                         0.42642979733767633,
        //                         -0.3307218357208677,
        //                         -0.6972781228344813
        //                     ],
        //                     [
        //                         -0.3387295781244705,
        //                         0.5450093538553459,
        //                         -0.2765515441652203,
        //                         -0.251165875457667
        //                     ],
        //                     [
        //                         0.12011550448519817,
        //                         0.6995451977618334,
        //                         0.4915315763091164,
        //                         0.38354320304354567
        //                     ],
        //                     [
        //                         -0.22954691332123342,
        //                         -0.224148423058881,
        //                         -0.10176371959640662,
        //                         -0.6410494769180961
        //                     ]
        //                 ]
        //             }
        //         ]
        //     }
    }, [])


    return (
        <div className="gameCanvasContainer">
            <canvas id="gameCanvas" ref={gameCanvasRef}/>
            <canvas id="visualizerCanvas" ref={visualizerCanvasRef}/>
        </div>
    )
}

export default GameCanvas
