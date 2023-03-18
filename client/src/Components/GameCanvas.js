import React, { useEffect, useRef, useState } from "react"

import backgroundMain from '../assets/demonwoodsmain.png'
import floor1 from '../assets/OakWoodsLandscape/decorations/floor1.png'
import floor2 from '../assets/OakWoodsLandscape/decorations/floor8.png'
import fullIdle from '../assets/NightBorneCharacter/NightborneIdleMain.png'
import fire from '../assets/fire_fx_v1.0/png/orange/loops/burning_loop_1.png'

import './GameCanvas.css'

function GameCanvas() {
    const gameCanvasRef = useRef(null)
    const visualizerCanvasRef = useRef(null)
    const simulationStarted = useRef(false)

    const [controls, setControls] = useState(false)
    const [gameActive, setGameActive] = useState(false)
    const [images, setImages] = useState({})
    const [reload, setReload] = useState(false)

    const [tempPopSize, setTempPopSize] = useState(50)
    const [tempGenSize, setTempGenSize] = useState(10)
    const [tempBrainVisualizer, setTempBrainVisualizer] = useState(true)
    const [tempDrawSensors, setTempDrawSensors] = useState(true)
    const [tempObsSpeed, setTempObsSpeed] = useState(2)
    const [tempObsMin, setTempObsMin] = useState(150)
    const [tempObsMax, setTempObsMax] = useState(350)
    const [tempRandomObs, setTempRandomObs] = useState(true)

    const [popSize, setPopSize] = useState(50)
    const [genSize, setGenSize] = useState(10)
    const [brainVisualizer, setBrainVisualizer] = useState(true)
    const [drawSensors, setDrawSensors] = useState(true)
    const [obsSpeed, setObsSpeed] = useState(2)
    const [obsMin, setObsMin] = useState(150)
    const [obsMax, setObsMax] = useState(350)
    const [randomObs, setRandomObs] = useState(true)

    const [tempChanged, setTempChanged] = useState(false)

    const [maxDistance, setMaxDistance] = useState(0)
    const [singleMaxDistance, setSingleMaxDistance] = useState(0)

    const [bestBrain, setBestBrain] = useState()

    function reloadGameState() {
        setTempChanged(false)
        setPopSize(tempPopSize)
        setGenSize(tempGenSize)
        setBrainVisualizer(tempBrainVisualizer)
        setDrawSensors(tempDrawSensors)
        setObsSpeed(tempObsSpeed)
        setObsMin(tempObsMin)
        setObsMax(tempObsMax)
        setRandomObs(tempRandomObs)
        setMaxDistance(0)
        setBestBrain()
        setGameActive(true)
        !reload ? setReload(true) : setReload(false)
    }

    function changeTemp() {
        if (!tempChanged) setTempChanged(true)
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = src
            img.onload = () => resolve(img)
            img.onerror = (err) => reject(err)
        })
    }

    function increment1(operator) {
        if (!controls) {
            if (operator == "-" && tempPopSize >= 20) {
                setTempPopSize((prev) => prev - 10)
            }

            if (operator == "+" && tempPopSize <= 90) {
                setTempPopSize((prev) => prev + 10)
            }

            changeTemp()
        }
    }

    function increment2(operator) {
        if (!controls) {
            if (operator == "-" && tempGenSize >= 10) {
                setTempGenSize((prev) => prev - 5)
            }

            if (operator == "+" && tempGenSize <= 95) {
                setTempGenSize((prev) => prev + 5)
            }

            changeTemp()
        }
    }

    function increment3(operator) {
        if (operator == "-" && tempObsSpeed >= 2) {
            setTempObsSpeed((prev) => prev - 1)
        }

        if (operator == "+" && tempObsSpeed <= 4) {
            setTempObsSpeed((prev) => prev + 1)
        }

        changeTemp()
    }

    function increment4(operator) {
        if (tempRandomObs) {
            if (operator == "-" && tempObsMin >= 175) {
                setTempObsMin((prev) => prev - 25)
            }

            if (operator == "+" && tempObsMin <= 275) {
                setTempObsMin((prev) => prev + 25)
            }

            changeTemp()
        }
    }

    function increment5(operator) {
        if (operator == "-" && tempObsMax >= 150) {
            setTempObsMax((prev) => prev - 50)
        }

        if (operator == "+" && tempObsMax <= 550) {
            setTempObsMax((prev) => prev + 50)
        }

        changeTemp()
    }

    function doNothing() {return}

    useEffect(() => {
        const loadImages = async () => {
            try {
                const characterImage = await loadImage(fullIdle)
                const obstacleImage = await loadImage(fire)
                const backgroundImage = await loadImage(backgroundMain)
                // Load other images if necessary

                setImages({
                    character: characterImage,
                    obstacle: obstacleImage,
                    background: backgroundImage
                    // Add other images if necessary
                })
            } catch (err) {
                console.error("Failed to load images:", err)
            }
        };

        loadImages()
    }, [])

    useEffect(() => {
        let gameCanvas = gameCanvasRef.current
        let gameCtx = gameCanvas.getContext("2d")

        gameCanvas.height = 576
        gameCanvas.width = 1024

        gameCtx.fillStyle = '#141414'
        gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

        let visualizerCanvas = visualizerCanvasRef.current
        let visualizerCtx = visualizerCanvas.getContext("2d")

        visualizerCanvas.height = 424
        visualizerCanvas.width = 424

        // visualizerCtx.fillStyle = '#010409'
        visualizerCtx.fillStyle = '#141414'
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
                gameCtx.drawImage(images.background, this.position.x, this.position.y)
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

        if (Object.keys(images).length !== 0) background.draw()

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

                const nodeRadius = 12
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

                if (!controls) this.brain = brain
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
                const rayFill = 'orange'

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

                    if (drawSensors) {
                        gameCtx.strokeStyle = rayColor
                        gameCtx.lineWidth = 2
                        gameCtx.beginPath()
                        gameCtx.moveTo(startX, startY)
                        gameCtx.lineTo(endX, endY)
                        gameCtx.stroke()
                    }

                    if (closestIntersection) {
                        if (drawSensors) {
                            gameCtx.strokeStyle = rayFill
                            gameCtx.lineWidth = 2
                            gameCtx.beginPath()
                            gameCtx.moveTo(endX, endY)
                            gameCtx.lineTo(closestIntersection.x, closestIntersection.y)
                            gameCtx.stroke()
                        }

                        // Normalize the ray length and add it to the array
                        rayLengthsNormalized.push(1 - (closestDistance / rayLength))
                    } else {
                        rayLengthsNormalized.push(0)
                    }
                }

                return rayLengthsNormalized
            }

            draw() {
                if (this.imageLoaded) {
                    gameCtx.drawImage(
                        images.character,
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
                // gameCtx.strokeStyle = 'red'
                // gameCtx.lineWidth = 2
                // gameCtx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

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
                    images.obstacle,
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
                // gameCtx.strokeStyle = 'red'
                // gameCtx.lineWidth = 2
                // gameCtx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

                // Update the frame timer and index
                this.frameTimer++
                if (this.frameTimer >= this.frameRate) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount
                    this.frameTimer = 0
                }
            }

            update() {
                this.x -= obsSpeed // 6 is not possible

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
        let currentMaxDistance = 0
        let bestBrain

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

                if (bestCharacter.distance > currentMaxDistance) {
                    currentMaxDistance = bestCharacter.distance
                    bestBrain = bestCharacter.brain
                }

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

        const cancellationToken = { cancelled: false }


        let character1

        if (controls && gameActive) {
            async function runChar() {
                character1 = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
                let distance = await runCharacter(character1, cancellationToken)
                setSingleMaxDistance(distance)
            }

            runChar()
        }


        const n = popSize
        const genNum = genSize

        if (!controls) {
            if (gameActive) runGenerations(genNum)
        }

        async function runGenerations(generations) {
            const characterTemplate = new Character(50, gameCanvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
            const population = new Population(n, characterTemplate, 0.6, 0.3)

            for (let generation = 0; generation < generations; generation++) {
                if (!cancellationToken.cancelled) {
                    resetGameState()
                    console.log("Generation:", generation)
                    await gameLoop(population)
                }
            }

            setMaxDistance(currentMaxDistance)
            setBestBrain(bestBrain)
            setGameActive(false)
        }

        async function gameLoop(population) {
            resetGameState()
            console.log("Running characters:", population.characters.map((c, i) => `Character ${i}: ${c.brain.levels[1].biases}`))
            await runCharacters(population.characters, cancellationToken)

            population.storeBestNeuralNetwork()
            population.createNextGeneration()
        }

        function runCharacters(characters, cancellationToken) {
            return new Promise((resolve) => {
                const completedCharacters = []

                // Create a copy of characters array with ids
                const charactersCopy = characters.map((character, index) => ({
                    character,
                    id: index,
                }))

                function loop() {
                    background.update()

                    if (!gameActive || cancellationToken.cancelled) {
                        return resolve(completedCharacters)
                    }

                    if (brainVisualizer) Visualizer.drawNetwork(visualizerCtx, charactersCopy[0].character.brain)

                    characters.forEach((character, index) => {
                        if (!character.completed) {
                            character.draw()
                            const rayData = character.drawSensors(obstacles).map((s) => (s === null ? 0 : s));
                            character.update()

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

                            character.distance++
                        }
                    })

                    if (obstacles.length === 0 || (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) < gameCanvas.width) {
                        createObstacle()
                    }

                    for (const [index, obstacle] of obstacles.entries()) {
                        obstacle.draw()
                        obstacle.update()

                        characters.forEach((character, i) => {
                            if (
                                !character.completed &&
                                character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                                character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                                character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                                character.hitbox.y + character.hitbox.height > obstacle.hitbox.y
                            ) {
                                // Collision detected
                                character.completed = true
                                completedCharacters.push(character)


                                // Remove character from charactersCopy based on id
                                const indexToRemove = charactersCopy.findIndex((charCopy) => charCopy.id === i);
                                if (indexToRemove !== -1) {
                                    charactersCopy.splice(indexToRemove, 1)
                                }
                            }
                        });

                        if (obstacle.x + obstacle.width < 0) {
                            obstacles.splice(index, 1)
                        }
                    }

                    if (completedCharacters.length < characters.length && characters.every(char => char.distance <= 32100)) {
                        requestAnimationFrame(loop)
                    } else {
                        requestAnimationFrame(() => resolve(completedCharacters))
                    }
                }

                loop()
            })
        }

        function createObstacle() {
            const minWidth = obsMin
            const maxWidth = obsMax - minWidth
            const x = (randomObs ? gameCanvas.width + (Math.floor(Math.random() * maxWidth)) + minWidth : gameCanvas.width + maxWidth)
            const y = gameCanvas.height - 166
            const width = 50
            const height = 50
            const obstacle = new Obstacle(x, y, width, height, 2.4, fire, 8, 12, 0, 0, 12, 26)
            obstacles.push(obstacle)
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

        function runCharacter(character, cancellationToken) {
            return new Promise((resolve) => {
                function loop() {
                    if (!gameActive || cancellationToken.cancelled) {
                        return resolve(character.distance)
                    }

                    background.update()

                    if (!character.completed) {
                        character.draw()
                        character.update()

                        character.velX = 0

                        if (keys.a.pressed && lastKey == 'a') {
                            character.moveLeft()
                        }

                        if (keys.d.pressed && lastKey == 'd') {
                            character.moveRight()
                        }

                        character.distance++
                    }

                    if (obstacles.length === 0 || (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) < gameCanvas.width) {
                        createObstacle()
                    }

                    for (const [index, obstacle] of obstacles.entries()) {
                        obstacle.draw()
                        obstacle.update()

                        if (!character.completed &&
                            character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                            character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                            character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                            character.hitbox.y + character.hitbox.height > obstacle.hitbox.y
                        ) {
                            // Collision detected
                            character.completed = true
                        }

                        if (obstacle.x + obstacle.width < 0) {
                            obstacles.splice(index, 1)
                        }
                    }

                    if (!character.completed) {
                        requestAnimationFrame(loop)
                    }
                    else {
                        requestAnimationFrame(() => resolve(character.distance))
                        setGameActive(false)
                    }
                }
                loop()
            })
        }

        if (controls && gameActive) {
            window.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'a':
                        keys.a.pressed = true
                        lastKey = 'a'
                        break
                    case 'd':
                        keys.d.pressed = true
                        lastKey = 'd'
                        break
                    case 'w':
                        character1.jump()
                        break
                    case 's':
                        character1.duck()
                        break
                    case 'A':
                        keys.a.pressed = true
                        lastKey = 'a'
                        break
                    case 'D':
                        keys.d.pressed = true
                        lastKey = 'd'
                        break
                    case 'W':
                        character1.jump()
                        break
                    case 'S':
                        character1.duck()
                        break
                    case 'ArrowLeft':
                        keys.a.pressed = true
                        lastKey = 'a'
                        break
                    case 'ArrowRight':
                        keys.d.pressed = true
                        lastKey = 'd'
                        break
                    case 'ArrowUp':
                        character1.jump()
                        break
                    case 'ArrowDown':
                        character1.duck()
                        break
                }
            })

            window.addEventListener('keyup', (event) => {
                switch (event.key) {
                    case 'a':
                        keys.a.pressed = false
                        break
                    case 'd':
                        keys.d.pressed = false
                        break
                    case 'A':
                        keys.a.pressed = false
                        break
                    case 'D':
                        keys.d.pressed = false
                        break
                    case 'ArrowLeft':
                        keys.a.pressed = false
                        break
                    case 'ArrowRight':
                        keys.d.pressed = false
                        break
                }
            })
        }

        // {
        //     "levels": [
        //         {
        //             "inputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0.6569999999999996,
        //                 0,
        //                 0,
        //                 0,
        //                 0.13108784486961322,
        //                 0,
        //                 0
        //             ],
        //             "outputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 1,
        //                 1,
        //                 0
        //             ],
        //             "biases": [
        //                 0.4032067461522169,
        //                 0.1954904497764104,
        //                 0.3412048370929178,
        //                 0.20777620619494164,
        //                 0.26520211183568476,
        //                 0.3347684396440648,
        //                 0.20766068907557858,
        //                 -0.9421886795821076,
        //                 0.020927476441136753,
        //                 0.08442333218677936
        //             ],
        //             "weights": [
        //                 [
        //                     -0.05730355254679259,
        //                     -0.0940642330754699,
        //                     0.1918229590037267,
        //                     0.21402866838240067,
        //                     -0.003340728131094428,
        //                     -0.36902377654743,
        //                     0.31842653448292746,
        //                     -0.03435372081333103,
        //                     0.5100708281921316,
        //                     0.12611586646300116
        //                 ],
        //                 [
        //                     0.12402144047402103,
        //                     0.22148436398603255,
        //                     0.3042248009846805,
        //                     -0.1816006559221747,
        //                     0.481860720933587,
        //                     0.036735730875665916,
        //                     -0.056084818782801915,
        //                     0.22961860604511902,
        //                     -0.09860335687569667,
        //                     -0.5313673773542387
        //                 ],
        //                 [
        //                     -0.2254004102037734,
        //                     0.07040713779262664,
        //                     -0.18991618076360278,
        //                     -0.14588686132904669,
        //                     -0.00013401997736937898,
        //                     -0.1699919522211895,
        //                     -0.027503422041739375,
        //                     0.2504357592613763,
        //                     -0.2509181988740524,
        //                     0.48813547995887163
        //                 ],
        //                 [
        //                     -0.3393134846011402,
        //                     0.18739028780116332,
        //                     0.13676150081729826,
        //                     -0.5695948906073739,
        //                     0.4717075017155356,
        //                     0.48415845885526404,
        //                     -0.48975093652676005,
        //                     0.016113018238467502,
        //                     0.05606642968557421,
        //                     -0.5436064771683139
        //                 ],
        //                 [
        //                     -0.30303843230187594,
        //                     -0.04621925831370895,
        //                     0.3167049691479175,
        //                     0.044835411805040165,
        //                     0.17049906934218295,
        //                     -0.11004273580480553,
        //                     0.10442386888137722,
        //                     0.29821050610223915,
        //                     0.565845876433591,
        //                     0.0064604992617361134
        //                 ],
        //                 [
        //                     -0.19196590338709113,
        //                     0.2710072219220361,
        //                     -0.15088554886876288,
        //                     -0.256037530496709,
        //                     -0.21578833099833977,
        //                     -0.0760856204456252,
        //                     0.22270966060785172,
        //                     0.3045527321696524,
        //                     0.16446831725705324,
        //                     0.5625605820177594
        //                 ],
        //                 [
        //                     0.34153323148535575,
        //                     -0.12012537610913104,
        //                     -0.5636037357663563,
        //                     -0.02500023783398342,
        //                     0.058480143205789994,
        //                     -0.08066198122317764,
        //                     -0.6347762400779402,
        //                     0.09259348156984432,
        //                     0.24376615071129232,
        //                     -0.060934117548973876
        //                 ],
        //                 [
        //                     -0.6254675970069358,
        //                     -0.4827518557882309,
        //                     -0.020437166446539312,
        //                     0.2678347847815012,
        //                     0.16547527960371067,
        //                     -0.02058412323899142,
        //                     0.04073378076641038,
        //                     0.0567291885264225,
        //                     0.3537816115939555,
        //                     0.20672970142323893
        //                 ],
        //                 [
        //                     -0.07444082736442884,
        //                     -0.12727057062986408,
        //                     -0.08050337607617997,
        //                     -0.655755853833828,
        //                     0.039211429156290785,
        //                     0.47347084629731573,
        //                     0.2180228456049883,
        //                     -0.11728427566615279,
        //                     -0.35383333868853445,
        //                     -0.11948038079001863
        //                 ],
        //                 [
        //                     -0.0831135930025795,
        //                     -0.06632711971339919,
        //                     -0.028766222332227698,
        //                     -0.5673748390335672,
        //                     -0.10433484483186654,
        //                     0.5677685472433643,
        //                     -0.10734237930666268,
        //                     -0.25356294663101375,
        //                     0.4430464387058346,
        //                     -0.019668991032096406
        //                 ],
        //                 [
        //                     0.05175094579174799,
        //                     0.09231875259708579,
        //                     -0.22413646844736906,
        //                     -0.1565522551051083,
        //                     -0.04777578707539121,
        //                     0.03353927497471294,
        //                     0.48249158495201483,
        //                     0.4880861078498969,
        //                     0.03620034301399383,
        //                     0.569776492166581
        //                 ],
        //                 [
        //                     0.05920855209004053,
        //                     0.44467905013730485,
        //                     0.25053036794292377,
        //                     -0.0379656543625336,
        //                     0.25098823478664806,
        //                     -0.12735149382752986,
        //                     -0.00917697561005304,
        //                     0.029568815593811457,
        //                     -0.02657290060547654,
        //                     0.013180191278350017
        //                 ],
        //                 [
        //                     0.13602768534861898,
        //                     0.3226214785230808,
        //                     0.2286343900434878,
        //                     -0.33554036271790333,
        //                     -0.04092726525131268,
        //                     -0.0969670091989637,
        //                     -0.22642254357279956,
        //                     -0.2037654929655946,
        //                     0.10873684595623684,
        //                     0.30306474511384046
        //                 ]
        //             ]
        //         },
        //         {
        //             "inputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 0,
        //                 1,
        //                 1,
        //                 0
        //             ],
        //             "outputs": [
        //                 0,
        //                 0,
        //                 0,
        //                 1
        //             ],
        //             "biases": [
        //                 0.3960649354111316,
        //                 0.4071008531620106,
        //                 0.11443675180809187,
        //                 0.005964237346354595
        //             ],
        //             "weights": [
        //                 [
        //                     0.2732988689417858,
        //                     0.3061695633091727,
        //                     -0.19422678368657778,
        //                     -0.32208504729977966
        //                 ],
        //                 [
        //                     -0.4498796570554358,
        //                     0.5642623535169514,
        //                     0.010286104941687496,
        //                     0.20453845552753527
        //                 ],
        //                 [
        //                     -0.14255442644361493,
        //                     0.1392295287951117,
        //                     -0.5810651105865061,
        //                     0.2671534365638607
        //                 ],
        //                 [
        //                     0.5597342579917558,
        //                     -0.2995846110285111,
        //                     0.33386448741720987,
        //                     -0.16828588455647872
        //                 ],
        //                 [
        //                     -0.5461824098641049,
        //                     0.20109885540176667,
        //                     -0.19251222598918344,
        //                     0.4092452026873994
        //                 ],
        //                 [
        //                     0.2095002248597413,
        //                     -0.40083452483852744,
        //                     0.019714142541561563,
        //                     -0.24127271051740679
        //                 ],
        //                 [
        //                     0.7463270668233967,
        //                     0.08200758436855823,
        //                     -0.09502707383677132,
        //                     -0.1030054873565929
        //                 ],
        //                 [
        //                     -0.06871184980659249,
        //                     0.38013946045738634,
        //                     -0.044145876107486104,
        //                     -0.006748280352109216
        //                 ],
        //                 [
        //                     0.26369352779762956,
        //                     -0.45182654151387075,
        //                     -0.1827800009646483,
        //                     0.07195189105219135
        //                 ],
        //                 [
        //                     -0.2588161569632543,
        //                     0.21884569422391884,
        //                     -0.042881448543748577,
        //                     -0.4649940564419074
        //                 ]
        //             ]
        //         }
        //     ]
        // }

        return () => {
            cancellationToken.cancelled = true
        }
    }, [controls, gameActive, images, reload])


    return (
        <React.Fragment>
            <div className="screen-warning">
                Your screen must be at least 1050px wide and 600px in height to use this app.
            </div>
            <div className="gameCanvasContainer">
                <div className="gameControlsContainer">
                    <div className="gameControlsContainerUpper">
                        <div className="gameControlContainer">
                            <p className="gameControlText">Character's Brain</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => !controls ? setControls(true) : setControls(false)}>
                                    <p className="gameControlerInteractIcon2">←</p>
                                </div>
                                <p className="gameControlInteractText">{!controls ? "Neural Network" : "Yours"}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => !controls ? setControls(true) : setControls(false)}>
                                    <p className="gameControlerInteractIcon2">→</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className={!controls ? "gameControlText" : "gameControlText crossThroughText"}>Population Size</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => increment1("-")}>
                                    <p className="gameControlerInteractIcon">-</p>
                                </div>
                                <p className="gameControlInteractText">{tempPopSize}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => increment1("+")}>
                                    <p className="gameControlerInteractIcon">+</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className={!controls ? "gameControlText" : "gameControlText crossThroughText"}># Generations</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => increment2("-")}>
                                    <p className="gameControlerInteractIcon">-</p>
                                </div>
                                <p className="gameControlInteractText">{tempGenSize}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => increment2("+")}>
                                    <p className="gameControlerInteractIcon">+</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className={!controls ? "gameControlText" : "gameControlText crossThroughText"}>Brain Visualizer</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer">
                                    <p className="gameControlerInteractIcon2" onClick={() => {!controls ? !tempBrainVisualizer ? setTempBrainVisualizer(true) : setTempBrainVisualizer(false) : doNothing(); changeTemp()}}>←</p>
                                </div>
                                <p className="gameControlInteractText">{tempBrainVisualizer ? "True" : "False"}</p>
                                <div className="gameControlInteractIconContainer">
                                    <p className="gameControlerInteractIcon2" onClick={() => {!controls ? !tempBrainVisualizer ? setTempBrainVisualizer(true) : setTempBrainVisualizer(false) : doNothing(); changeTemp()}}>→</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className="gameControlText">Draw Sensors</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => {!tempDrawSensors ? setTempDrawSensors(true) : setTempDrawSensors(false); changeTemp()}}>
                                    <p className="gameControlerInteractIcon2">←</p>
                                </div>
                                <p className="gameControlInteractText">{tempDrawSensors ? "True" : "False"}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => {!tempDrawSensors ? setTempDrawSensors(true) : setTempDrawSensors(false); changeTemp()}}>
                                    <p className="gameControlerInteractIcon2">→</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gameControlsContainerLower">
                        <div className="gameControlContainer">
                            <p className="gameControlText">Obstacle Speed</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => increment3("-")}>
                                    <p className="gameControlerInteractIcon">-</p>
                                </div>
                                <p className="gameControlInteractText">{tempObsSpeed}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => increment3("+")}>
                                    <p className="gameControlerInteractIcon">+</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className={tempRandomObs ? "gameControlText" : "gameControlText crossThroughText"}>Obstacle Min Seperation</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => increment4("-")}>
                                    <p className="gameControlerInteractIcon">-</p>
                                </div>
                                <p className="gameControlInteractText">{tempObsMin}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => increment4("+")}>
                                    <p className="gameControlerInteractIcon">+</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className="gameControlText">Obstacle Max Seperation</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => increment5("-")}>
                                    <p className="gameControlerInteractIcon">-</p>
                                </div>
                                <p className="gameControlInteractText">{tempObsMax}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => increment5("+")}>
                                    <p className="gameControlerInteractIcon">+</p>
                                </div>
                            </div>
                        </div>
                        <div className="gameControlContainer">
                            <p className="gameControlText">Random Obstacle Seperation</p>
                            <div className="gameControlInteract">
                                <div className="gameControlInteractIconContainer" onClick={() => {!tempRandomObs ? setTempRandomObs(true) : setTempRandomObs(false); changeTemp()}}>
                                    <p className="gameControlerInteractIcon2">←</p>
                                </div>
                                <p className="gameControlInteractText">{tempRandomObs ? "True" : "False"}</p>
                                <div className="gameControlInteractIconContainer" onClick={() => {!tempRandomObs ? setTempRandomObs(true) : setTempRandomObs(false); changeTemp()}}>
                                    <p className="gameControlerInteractIcon2">→</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="gameControlsContainerLower2">
                        <button className="gameControlStartButton" onClick={() => {gameActive ? setGameActive(false) : doNothing(); reloadGameState();}}>Start Game</button>
                        <button className="gameControlEndButton" onClick={() => setGameActive(false)}>End Game</button>
                        {/* <button className={!tempChanged ? "gameControlApplyButton" : "gameControlApplyButton button-glow"} onClick={reloadGameState}>Apply Changes</button> */}
                    </div>
                </div>
                <div className="gameCanvasContainerMain">
                    {!gameActive && singleMaxDistance > 0 &&
                        <div className="gameOverContainer">
                            <p className="gameOverHeader">Game over!</p>
                            <p className="gameOverText">{'Max Distance: ' + singleMaxDistance}</p>
                        </div>
                    }
                    <canvas id="gameCanvas" ref={gameCanvasRef}/>
                </div>
                <p className={!controls ? "lowerCanvasTitle" : "lowerCanvasTitle crossThroughText"}>Neural Network Stats</p>
                <div className="lowerCanvasContainer">
                    <div className="lowerCanvasContainerLeft">
                        <div className="visualizerCanvasContainer">
                            <canvas id="visualizerCanvas" ref={visualizerCanvasRef}/>
                        </div>
                    </div>
                    <div className="lowerCanvasContainerRight">
                        <div className="lowerCanvasContainerRightStatsContainer">
                            <p className="lowerCanvasStatHeader">Max Distance: </p>
                            <p className="lowerCanvasStatText">{maxDistance}</p>
                            <p className="lowerCanvasStatHeader">Best Brain: </p>
                            <p className="lowerCanvasStatText2">{JSON.stringify(bestBrain, null, 2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default GameCanvas
