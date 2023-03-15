import React, { useEffect, useRef } from "react"

import backgroundMain from '../assets/parallax_demon_woods_pack/parallax_demon_woods_pack/layers/demonwoods.png'
import floor1 from '../assets/OakWoodsLandscape/decorations/floor1.png'
import floor2 from '../assets/OakWoodsLandscape/decorations/floor8.png'
import fullIdle from '../assets/NightBorneCharacter/NightborneIdleMain.png'
import idle1 from '../assets/NightBorneCharacter/idle1.png'
import idle2 from '../assets/NightBorneCharacter/idle2.png'
import fire from '../assets/fire_fx_v1.0/png/orange/loops/burning_loop_1.png'

import './GameCanvas.css'

function GameCanvas() {
    const canvasRef = useRef(null)

    useEffect(() => {
        let canvas = canvasRef.current
        let ctx = canvas.getContext("2d")

        canvas.height = 576
        canvas.width = 1024

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

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
                ctx.drawImage(this.image, this.position.x, this.position.y)
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

        class Character {
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
                this.onGround = true
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
                    width: 70,
                    height: this.frameHeight
                }
            }

            drawSensors(obstacles) {
                const rayLength = 400
                const rayColor = 'white'
                const rayFill = 'black'

                for (let angle = -90; angle <= 90; angle += 15) {
                    const radians = angle * (Math.PI / 180)
                    const endX = this.x + this.hitboxOffsetX + rayLength * Math.cos(radians)
                    const endY = this.y + this.hitboxOffsetY + this.height / 2 - rayLength * Math.sin(radians)

                    let closestIntersection = null
                    let closestDistance = Infinity

                    for (const obstacle of obstacles) {
                        const intersection = rayObstacleIntersection(this.x + this.hitboxOffsetX, this.y + this.hitboxOffsetY + this.height / 2, endX, endY, obstacle)
                        if (intersection && intersection.distance < closestDistance) {
                            closestDistance = intersection.distance
                            closestIntersection = intersection
                        }
                    }

                    ctx.strokeStyle = rayColor
                    ctx.beginPath()
                    ctx.moveTo(this.x + this.hitboxOffsetX, this.y + this.hitboxOffsetY + this.height / 2)
                    ctx.lineTo(endX, endY)
                    ctx.stroke()

                    if (closestIntersection) {
                        ctx.strokeStyle = rayFill
                        ctx.beginPath()
                        ctx.moveTo(this.x + this.hitboxOffsetX, this.y + this.hitboxOffsetY + this.height / 2)
                        ctx.lineTo(closestIntersection.x, closestIntersection.y)
                        ctx.stroke()
                    }
                }
            }

            draw() {
                ctx.drawImage(
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
                ctx.strokeStyle = 'red'
                ctx.lineWidth = 2
                ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

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

                this.y += this.velY

                if (this.y + this.height > canvas.height + 8) {
                    this.y = (canvas.height + 8) - this.height
                    this.velY = 0
                    this.onGround = true
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
                    height: this.frameHeight * this.scale
                }
            }

            draw() {
                ctx.drawImage(
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
                ctx.strokeStyle = 'red'
                ctx.lineWidth = 2
                ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

                // Update the frame timer and index
                this.frameTimer++
                if (this.frameTimer >= this.frameRate) {
                    this.frameIndex = (this.frameIndex + 1) % this.frameCount
                    this.frameTimer = 0
                }
            }

            update() {
                this.x -= 1

                if (this.x + this.width < 0) {
                    // this.x = canvas.width
                    // this.height = Math.floor(Math.random() * 100) + 50
                    this.height = 50
                    this.y = canvas.height - this.height
                }

                // Update hitbox
                this.hitbox.x = this.x + this.hitboxOffsetX
                this.hitbox.y = this.y + this.hitboxOffsetY
            }
        }

        const character = new Character(50, canvas.height - 100, 50, 100, 1, fullIdle, 9, 12, 0, 0, 32, 0)
        const obstacles = []

        function createObstacle() {
            const x = canvas.width
            const y = canvas.height - 50
            const width = 50
            const height = 50
            const obstacle = new Obstacle(x, y, width, height, 2.4, fire, 8, 12, 0, -26, 12, 32)
            obstacles.push(obstacle)
        }

        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            background.update()
            character.draw()
            character.drawSensors(obstacles)
            character.update()

            if (obstacles.length === 0 || (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) < canvas.width - 300) {
                createObstacle()
            }

            let collisionDetected = false

            for (const [index, obstacle] of obstacles.entries()) {
                obstacle.draw()
                obstacle.update()

                if (character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                    character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                    character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                    character.hitbox.y + character.hitbox.height > obstacle.hitbox.y) {
                    // Collision detected
                    collisionDetected = true
                    break
                }

                if (obstacle.x + obstacle.width < 0) {
                    obstacles.splice(index, 1)
                }
            }

            if (!collisionDetected) {
                requestAnimationFrame(gameLoop)
            }
        }


        document.addEventListener('keydown', e => {
            if (e.code === 'Space' && character.onGround) {
                character.velY = -15
                character.onGround = false
            }
        })

        gameLoop()

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
                ctx.drawImage(this.image, this.position.x, this.position.y)
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

        const keys = {
            a: {
                pressed: false
            },
            d: {
                pressed: false
            }
        }

        let lastKey

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

        // drawFloor()

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
                    character.velY = -8
                    break
                case 's':
                    if (character.y + character.height + character.velY < canvas.height - 88) {
                        character.velY = 4
                    }
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
                    if (character.currentJumps < 2) {
                        if (character.currentJumps === 1) character.velocity.y = -6
                        else character.velocity.y = -8
                        character.currentJumps++
                    }
                    break
                case 'S':
                    if (character.position.y + character.height + character.velocity.y < canvas.height - 88) {
                        character.velocity.y = 4
                    }
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
                    if (character.currentJumps < 2) {
                        if (character.currentJumps === 1) character.velocity.y = -6
                        else character.velocity.y = -8
                        character.currentJumps++
                    }
                    break
                case 'ArrowDown':
                    if (character.position.y + character.height + character.velocity.y < canvas.height - 88) {
                        character.velocity.y = 4
                    }
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

    }, [])


    return (
        <div className="gameCanvasContainer">
            <canvas id="gameCanvas" ref={canvasRef}/>
        </div>
    )
}

export default GameCanvas
