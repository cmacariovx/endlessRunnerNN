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
    const [showModal, setShowModal] = useState(true);

    const [tempPopSize, setTempPopSize] = useState(50)
    const [tempGenSize, setTempGenSize] = useState(10)
    const [tempBrainVisualizer, setTempBrainVisualizer] = useState(true)
    const [tempDrawSensors, setTempDrawSensors] = useState(true)
    const [tempObsSpeed, setTempObsSpeed] = useState(3)
    const [tempObsMin, setTempObsMin] = useState(150)
    const [tempObsMax, setTempObsMax] = useState(350)
    const [tempRandomObs, setTempRandomObs] = useState(true)
    const [tempNewNeuralNetwork, setTempNewNeuralNetwork] = useState(true)

    const [popSize, setPopSize] = useState(50)
    const [genSize, setGenSize] = useState(10)
    const [brainVisualizer, setBrainVisualizer] = useState(true)
    const [drawSensors, setDrawSensors] = useState(true)
    const [obsSpeed, setObsSpeed] = useState(3)
    const [obsMin, setObsMin] = useState(150)
    const [obsMax, setObsMax] = useState(350)
    const [randomObs, setRandomObs] = useState(true)
    const [newNeuralNetwork, setNewNeuralNetwork] = useState(true)

    const [tempChanged, setTempChanged] = useState(false)

    const [maxDistance, setMaxDistance] = useState(0)
    const [singleMaxDistance, setSingleMaxDistance] = useState(0)
    const [currentGeneration, setCurrentGeneration] = useState(0)

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
        setNewNeuralNetwork(tempNewNeuralNetwork)
        setCurrentGeneration(0)
        setMaxDistance(0)
        setBestBrain()
        setGameActive(true)
        !reload ? setReload(true) : setReload(false)
    }

    function changeTemp() {
        if (!tempChanged) setTempChanged(true)
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
        if (operator == "-" && tempObsMax >= 200) {
            setTempObsMax((prev) => prev - 50)
        }

        if (operator == "+" && tempObsMax <= 450) {
            setTempObsMax((prev) => prev + 50)
        }

        changeTemp()
    }

    function doNothing() {return}

    useEffect(() => {
        function loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image()
                img.src = src
                img.onload = () => resolve(img)
                img.onerror = (err) => reject(err)
            })
        }

        const loadImages = async () => {
            try {
                const characterImage = await loadImage(fullIdle)
                const obstacleImage = await loadImage(fire)
                const backgroundImage = await loadImage(backgroundMain)
                const floor1Image = await loadImage(floor1)
                const floor2Image = await loadImage(floor2)
                // Load other images if necessary

                setImages({
                    character: characterImage,
                    obstacle: obstacleImage,
                    background: backgroundImage,
                    floor1: floor1Image,
                    floor2: floor2Image
                    // Add other images if necessary
                })
            } catch (err) {
                console.error("Failed to load images:", err)
            }
        }

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

        let mainFloorsArr = []
        let subFloorsArr = []
        let subFloorsArr2 = []
        let subFloorsArr3 = []


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
                    level.outputs[i] = elu(sum + level.biases[i])
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
                let outputs = Level.feedForward(givenInputs, network.levels[0])

                for (let i = 1; i < network.levels.length - 1; i++) {
                    outputs = Level.feedForward(outputs, network.levels[i])
                }

                // Apply softmax to the output layer
                outputs = Level.feedForward(outputs, network.levels[network.levels.length - 1])
                outputs = softmax(outputs)

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

        function elu(x, alpha = 1) {
            return x >= 0 ? x : alpha * (Math.exp(x) - 1)
        }

        function softmax(arr) {
            const expArr = arr.map(x => Math.exp(x))
            const sum = expArr.reduce((a, b) => a + b)
            return expArr.map(x => x / sum)
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
                            )
                            ctx.lineTo(
                                Visualizer.getNodeX(outputs, j, left, right),
                                top
                            )
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
                this.imageLoaded = false
                this.image.addEventListener('load', () => {
                  this.imageLoaded = true
                })
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

            decideAction(outputs) {
                const [moveLeft, moveRight, jump, duck] = outputs
                const maxOutput = Math.max(moveLeft, moveRight, jump, duck)

                if (maxOutput === moveLeft) {
                    this.moveLeft()
                }
                else if (maxOutput === moveRight) {
                    this.moveRight()
                }
                else if (maxOutput === jump) {
                    this.jump()
                }
                else if (maxOutput === duck) {
                    this.duck()
                }
            }

            drawSensors(obstacles) {
                const rayLength = 400
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
                if (Object.keys(images).length !== 0) {
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
                this.velX = obsSpeed
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
                this.x -= this.velX // 6 is not possible

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

        let storedBestNeuralNetwork
        let storedBestMaxDistance

        async function saveBrain() {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "main/saveBrain", {
                method: "POST",
                body: JSON.stringify({
                    brain: {
                        "levels": [
                            {
                                "inputs": [
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0.6464999999999999,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0,
                                    0
                                ],
                                "outputs": [
                                    0.009615551569930714,
                                    0.06297116886704753,
                                    0.18179966607165646,
                                    0.02963565540834036,
                                    0.19048947153631865,
                                    0.08285433268026732,
                                    0.11641750371398285,
                                    0.14466530086421808,
                                    0.5732591667104384,
                                    0.20804395763193373
                                ],
                                "biases": [
                                    0.1393134331451877,
                                    0.09365177023542262,
                                    0.1585696624101375,
                                    0.14967676259631715,
                                    0.02605429995076028,
                                    -0.16644507354536406,
                                    -0.10091199238371601,
                                    0.1539511490936255,
                                    0.45996804984554573,
                                    0.05367939196016511
                                ],
                                "weights": [
                                    [
                                        0.24712292596185872,
                                        0.05343229272320457,
                                        -0.2169808117708868,
                                        0.39599193611472094,
                                        -0.14373797769639257,
                                        0.18618941473514167,
                                        -0.1638673892221267,
                                        0.11537405580165332,
                                        0.11704959253321506,
                                        0.1042135691838319
                                    ],
                                    [
                                        0.25687698818880883,
                                        -0.2924726490801556,
                                        0.47288342210270845,
                                        0.15099518412503093,
                                        0.04416697123524452,
                                        -0.15277103628376654,
                                        0.23719557713580455,
                                        -0.05454423865994613,
                                        0.16362244125338693,
                                        0.04496338501871105
                                    ],
                                    [
                                        -0.27411258466052135,
                                        -0.2796030235677711,
                                        0.2394532601763873,
                                        0.05293699696166057,
                                        -0.03738871059964216,
                                        -0.2794894890680837,
                                        -0.249678014018533,
                                        0.1779208681531972,
                                        -0.020545915894570665,
                                        0.2149145326168233
                                    ],
                                    [
                                        0.2885252879318644,
                                        0.1975385943729074,
                                        -0.00793801476251664,
                                        0.030130579974895405,
                                        0.02892134061665072,
                                        -0.22783971023766697,
                                        0.021196300137187457,
                                        -0.25258542926083316,
                                        -0.2556796794426289,
                                        0.267744052865702
                                    ],
                                    [
                                        -0.06579059011403701,
                                        -0.013793042663606772,
                                        -0.1825684319836937,
                                        0.057514892698084026,
                                        0.07776503730391869,
                                        -0.40217474522710944,
                                        0.2779420333714812,
                                        0.23871837486580247,
                                        -0.07945630909208128,
                                        0.009603001881277773
                                    ],
                                    [
                                        0.017841084568498467,
                                        -0.06634456065250874,
                                        0.07034396447952262,
                                        -0.04520548396886523,
                                        0.14031669593877505,
                                        0.18901946542289216,
                                        0.09751512070561844,
                                        0.04521854250485552,
                                        0.11685675077854005,
                                        0.22188494917574766
                                    ],
                                    [
                                        -0.20061543940488324,
                                        -0.04745645996655081,
                                        0.03593194688556682,
                                        -0.18567843339207551,
                                        0.2543467464587137,
                                        0.3856139307434361,
                                        0.3361631803522025,
                                        -0.014363260989029292,
                                        0.17523761309341487,
                                        0.23876962980938693
                                    ],
                                    [
                                        0.28824618050502054,
                                        0.0520766254628528,
                                        0.04416402514959403,
                                        0.4922044042784338,
                                        -0.07976325570012252,
                                        -0.2895300098504039,
                                        0.03533967999163268,
                                        -0.04041165831697318,
                                        0.07731392615410632,
                                        -0.00610071660664159
                                    ],
                                    [
                                        -0.16246789332400452,
                                        -0.5991054265407899,
                                        -0.13035650365889528,
                                        0.31616558351307705,
                                        0.30995298065556953,
                                        0.04494265929427718,
                                        0.1888498042093044,
                                        0.024894004904984016,
                                        -0.22557423683283995,
                                        -0.03525241372823172
                                    ],
                                    [
                                        -0.10408096476754598,
                                        0.4531199733991861,
                                        -0.6714567927313757,
                                        0.09054767319451663,
                                        -0.1906467246750889,
                                        -0.12906300219193134,
                                        -0.17811651912708587,
                                        -0.121041215780297,
                                        -0.0504142585180201,
                                        0.36774898529329914
                                    ],
                                    [
                                        0.008062276708744681,
                                        -0.2986974821630433,
                                        -0.31875743428739234,
                                        0.3616588165436738,
                                        -0.37824718953893965,
                                        -0.19176938687500092,
                                        -0.21929916816568218,
                                        0.08404313828268256,
                                        -0.09730745885608404,
                                        0.08338611307738189
                                    ],
                                    [
                                        0.2022699622858859,
                                        -0.07743262770077819,
                                        0.007605700097259006,
                                        0.4587600491271301,
                                        0.20880716837327362,
                                        -0.07209263038846678,
                                        -0.11444918736718737,
                                        -0.22989001694520356,
                                        -0.22963922986577842,
                                        -0.08764433017462295
                                    ],
                                    [
                                        -0.026742522939122354,
                                        0.016240795754483103,
                                        0.28761336838333595,
                                        0.1588213306894117,
                                        -0.42855651464539657,
                                        -0.016935025381286106,
                                        -0.11315260532599111,
                                        -0.2027763594594409,
                                        -0.365341877731827,
                                        0.016250816671565665
                                    ]
                                ]
                            },
                            {
                                "inputs": [
                                    0.009615551569930714,
                                    0.06297116886704753,
                                    0.18179966607165646,
                                    0.02963565540834036,
                                    0.19048947153631865,
                                    0.08285433268026732,
                                    0.11641750371398285,
                                    0.14466530086421808,
                                    0.5732591667104384,
                                    0.20804395763193373
                                ],
                                "outputs": [
                                    -0.08742927445824078,
                                    -0.18656800519318684,
                                    -0.3966390390321147,
                                    -0.06172433371250685
                                ],
                                "biases": [
                                    -0.021551830266770794,
                                    -0.26090399190337166,
                                    -0.30900674051437643,
                                    -0.20035819494610482
                                ],
                                "weights": [
                                    [
                                        -0.08135767056118033,
                                        -0.24571244553347624,
                                        0.1855830896632738,
                                        -0.16560248835820263
                                    ],
                                    [
                                        -0.09008689479128867,
                                        -0.014385696544235216,
                                        -0.11731326004019728,
                                        -0.026932710148838468
                                    ],
                                    [
                                        0.1165955733018305,
                                        0.16906926030594588,
                                        -0.2558840558530188,
                                        0.11354166394398262
                                    ],
                                    [
                                        -0.10916242967586429,
                                        -0.20499658099642354,
                                        0.06523771063605872,
                                        -0.19843320483899443
                                    ],
                                    [
                                        -0.011448238768425656,
                                        -0.08553496610381066,
                                        0.024994535089676837,
                                        0.2426798502437274
                                    ],
                                    [
                                        -0.1908314677589662,
                                        -0.06904385048110871,
                                        -0.28303832976394194,
                                        -0.20165926218993846
                                    ],
                                    [
                                        0.03627006096156385,
                                        0.05399341344082392,
                                        -0.24598240565123386,
                                        0.0000987499213477407
                                    ],
                                    [
                                        0.09639442906756684,
                                        -0.16532519373519297,
                                        0.14062210864339492,
                                        0.05181918220154885
                                    ],
                                    [
                                        -0.09277647699525547,
                                        0.08738730191612282,
                                        -0.18395236697624823,
                                        0.148852293621409
                                    ],
                                    [
                                        -0.13667817908233826,
                                        0.10847524518043135,
                                        -0.06540980451878123,
                                        0.0135328403012131
                                    ]
                                ]
                            }
                        ]
                    },
                    maxDistance: 33597
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            })

            const data = await response.json()
            console.log(data)
            return data
        }

        saveBrain()

        async function fetchBrain() {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + "main/fetchBrain", {
                method: "POST",
                body: JSON.stringify({
                    newNeuralNetwork: newNeuralNetwork
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            })

            const data = await response.json()
            return data
        }

        class Population {
            constructor(size, characterTemplate, ratio1 = 0.7, ratio2 = 0.2) {
                this.size = size
                this.characterTemplate = characterTemplate
                this.ratio1 = ratio1
                this.ratio2 = ratio2
                this.characters = []

                // this.createInitialPopulation()
            }

            static async create(size, characterTemplate, ratio1 = 0.7, ratio2 = 0.2) {
                const population = new this(size, characterTemplate, ratio1, ratio2)
                await population.createInitialPopulation()
                return population
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

                if (bestCharacter.distance > storedBestMaxDistance) {
                    saveBrain()
                }
            }

            async createInitialPopulation() {
                storedBestNeuralNetwork = await fetchBrain()

                // const storedBestNeuralNetwork = localStorage.getItem('bestNeuralNetwork')

                if (!newNeuralNetwork && storedBestNeuralNetwork) {
                    storedBestMaxDistance = storedBestNeuralNetwork.maxDistance
                    storedBestNeuralNetwork = JSON.parse(JSON.stringify(storedBestNeuralNetwork.brain))
                    // const bestBrain = JSON.parse(storedBestNeuralNetwork, (_, value) => {
                    //     return typeof value === 'string' && value.startsWith('function') ?
                    //         Function.call(null, `return ${value}`)() : value
                    // })

                    const bestBrain = storedBestNeuralNetwork

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

                // const bestBrain = JSON.parse(JSON.stringify(storedBestNeuralNetwork))

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
            const population = await Population.create(n, characterTemplate, 0.7, 0.2)

            for (let generation = 0; generation < generations; generation++) {
                if (!cancellationToken.cancelled) {
                    setCurrentGeneration(generation)
                    setMaxDistance(currentMaxDistance)
                    setBestBrain(bestBrain)
                    resetGameState()
                    await gameLoop(population)
                }
            }

            setGameActive(false)
        }

        async function gameLoop(population) {
            resetGameState()
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
                    drawFloor()

                    if (!gameActive || cancellationToken.cancelled) {
                        return resolve(completedCharacters)
                    }

                    if (brainVisualizer) Visualizer.drawNetwork(visualizerCtx, charactersCopy[0].character.brain)

                    characters.forEach((character, index) => {
                        if (!character.completed) {
                            character.velX = 0

                            const inputs = character.drawSensors(obstacles)
                            const outputs = NeuralNetwork.feedForward(inputs, character.brain)
                            character.decideAction(outputs)
                            character.update()
                            character.draw()

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
                                const indexToRemove = charactersCopy.findIndex((charCopy) => charCopy.id === i)
                                if (indexToRemove !== -1) {
                                    charactersCopy.splice(indexToRemove, 1)
                                }
                            }
                        })

                        if (obstacle.x + obstacle.width < 0) {
                            obstacles.splice(index, 1)
                        }
                    }

                    if (completedCharacters.length < characters.length && characters.every(char => char.distance <= 50000)) {
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
                gameCtx.drawImage(images.floor1, this.position.x, this.position.y)
            }

            update() {
                this.position.x += this.velocity.x
                if (this.position.x < -72) this.position.x = 1024
                if (Object.keys(images).length !== 0) this.draw()
            }
        }

        class Floor2 {
            constructor({ position, velocity, imageSrc }) {
                this.position = position
                this.height = 150
                this.width = 50
                this.image = new Image()
                this.image.src = imageSrc
                this.velocity = velocity
            }

            draw() {
                gameCtx.drawImage(images.floor2, this.position.x, this.position.y)
            }

            update() {
                this.position.x += this.velocity.x
                if (this.position.x < -72) this.position.x = 1024
                if (Object.keys(images).length !== 0) this.draw()
            }
        }

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

        let xPosition2 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr.push(new Floor2({
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

        let xPosition3 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr2.push(new Floor2({
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

        let xPosition4 = 954

        for (let i = 0; i < 16; i++) {
            subFloorsArr3.push(new Floor2({
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
            // window.requestAnimationFrame(drawFloor)
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

        function runCharacter(character, cancellationToken) {
            return new Promise((resolve) => {
                function loop() {
                    if (!gameActive || cancellationToken.cancelled) {
                        return resolve(character.distance)
                    }

                    background.update()
                    drawFloor()

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

        return () => {
            cancellationToken.cancelled = true
        }
    }, [controls, gameActive, images, reload])

    const handleModalClick = () => {
        setShowModal(false);
    };

    const handleModalContentClick = (event) => {
        event.stopPropagation();
    };

    return (
        <React.Fragment>
            <div className="screen-warning">
                Your screen must be at least 1050px wide and 600px in height to use this app.
            </div>
            <div className="gameCanvasContainer">
                {showModal &&
                    <div className='modal-container' onClick={handleModalClick}>
                        <div className='modal-content' onClick={handleModalContentClick}>
                            <p className="modalText1">This game is graphically and computationally heavy. A dedicated GPU is recommended for optimal performance. It will appear very slow and laggy on computers without a dedicated GPU.</p>
                            <p className="modalText2">Note that our trained neural network is a starting point and it may take a couple generations to adapt to your environment settings. Using a higher population will enable faster convergence.</p>
                            <p className="modalText3">If you want to train your own new character, a population of 100 is recommended for the fastest convergence. Note that this is ~1.2 million synaptic connections per second for 100 characters, not including the graphics rendering, sensor computing and preprocessing happening 60 times per second, per character. <br></br><br></br>Again, a dedicated GPU is recommended.</p>
                        </div>
                    </div>
                }
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
                    {!controls && <div className="gameControlsContainerLower3">
                        <p className="gameControlsContainerLower3Header">Choose which Neural Network to start with</p>
                        <div className="gameControlsContainerLower3ButtonsContainer">
                            <button className={!tempNewNeuralNetwork ? "gameControlsContainerLower3Button1" : "gameControlsContainerLower3Button1 activeButton"} onClick={() => setTempNewNeuralNetwork(true)}>New Neural Network</button>
                            <button className={tempNewNeuralNetwork ? "gameControlsContainerLower3Button2" : "gameControlsContainerLower3Button2 activeButton"} onClick={() => setTempNewNeuralNetwork(false)}>Trained Neural Network</button>
                        </div>
                    </div>}
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
                            <p className="lowerCanvasStatHeader">Current Generation: </p>
                            <p className="lowerCanvasStatText">{currentGeneration}</p>
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
