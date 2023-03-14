import React, { useEffect, useRef } from "react";

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

        class Sprite {
            constructor({ position, velocity, imageSrc, scale = 1, framesMax = 1 }) {
                this.position = position
                this.velocity = velocity
                this.height = 100
                this.width = 100
                this.image = new Image()
                this.image.src = imageSrc
                this.isOnGround = true
                this.currentJumps = 0
                this.scale = scale
                this.framesMax = framesMax
                this.framesCurrent = 0
                this.framesElapsed = 0
                this.framesHold = 12
                this.hitbox = {
                    position: this.position,
                    height: 100,
                    width: this.width
                }
            }

            drawPlayer() {
                ctx.drawImage(
                    this.image,
                    this.framesCurrent * (this.image.width / this.framesMax),
                    0,
                    this.image.width / this.framesMax,
                    this.image.height,
                    this.position.x,
                    this.position.y,
                    (this.image.width / this.framesMax) * this.scale,
                    this.image.height * this.scale
                )
                // ctx.fillStyle = 'red'
                // ctx.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)

            }

            update() {
                this.drawPlayer()
                this.framesElapsed++

                if (this.framesElapsed % this.framesHold === 0) {
                    if (this.framesCurrent < this.framesMax - 1) {
                        this.framesCurrent++
                    }
                    else {
                        this.framesCurrent = 0
                    }
                }

                if (this.velocity.y === 0) {
                    this.isOnGround = true
                    this.currentJumps = 0
                }
                else this.isOnGround = false

                this.position.x += this.velocity.x
                this.position.y += this.velocity.y

                if (this.position.y + this.height + this.velocity.y >= canvas.height - 88) {
                    this.velocity.y = 0
                }
                else {
                    this.velocity.y += gravity
                }
            }
        }

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

        let obstacles = []
        let obstacleId = 0

        class Obstacle {
            constructor({ position, velocity, imageSrc, scale = 1, framesMax = 1 }) {
                this.position = position
                this.velocity = velocity
                this.height = 150
                this.width = 50
                this.image = new Image()
                this.image.src = imageSrc
                this.obstacleId = obstacleId + 1
                this.scale = scale
                this.framesMax = framesMax
                this.framesCurrent = 0
                this.framesElapsed = 0
                this.framesHold = 15
            }

            draw() {
                ctx.drawImage(
                    this.image,
                    this.framesCurrent * (this.image.width / this.framesMax),
                    0,
                    this.image.width / this.framesMax,
                    this.image.height,
                    this.position.x,
                    this.position.y,
                    (this.image.width / this.framesMax) * this.scale,
                    this.image.height * this.scale)
            }

            update() {
                this.position.x += this.velocity.x
                if (this.position.x < -40) {
                    for (let i = 0; i < obstacles.length; i++) {
                        let obstacle = obstacles[i]
                        if (obstacle.obstacleId === this.obstacleId) {
                            obstacles.splice(i, 1)
                        }
                    }
                    spawnObstacle()
                }
                this.draw()
                this.framesElapsed++

                if (this.framesElapsed % this.framesHold === 0) {
                    if (this.framesCurrent < this.framesMax - 1) {
                        this.framesCurrent++
                    }
                    else {
                        this.framesCurrent = 0
                    }
                }
            }
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
                ctx.drawImage(this.image, this.position.x, this.position.y)
            }

            update() {
                this.position.x += this.velocity.x
                if (this.position.x < -72) this.position.x = 1024
                this.draw()
            }
        }

        const player = new Sprite({
            position: {
                x: 0,
                y: 0
            },
            velocity: {
                x: 0,
                y: 0
            },
            imageSrc: fullIdle,
            scale: 1,
            framesMax: 9
        })

        const background = new Background({
            position: {
                x: 0,
                y: 0
            },
            imageSrc: backgroundMain
        })

        let maxStartObstacles = 5

        function spawnInitialObstacles() {
            for (let i = 0; i < maxStartObstacles; i++) {
                spawnObstacle()
            }
        }

        spawnInitialObstacles()

        function spawnObstacle() {
            let obstacleX = (Math.floor(Math.random() * canvas.width)) + canvas.width

            if (obstacles.length) {
                let lastObstacleX = obstacles[obstacles.length - 1].position.x

                while (obstacleX - lastObstacleX < 200 && obstacleX - lastObstacleX > 100) {
                    obstacleX += 100
                }
            }

            obstacles.push(new Obstacle({
                position: {
                    x: obstacleX,
                    y: 424
                },
                velocity: {
                    x: -1.4,
                    y: 0
                },
                imageSrc: fire,
                scale: 2,
                framesMax: 8
            }))
            obstacleId++
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

        function animate() {
            window.requestAnimationFrame(animate)
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            background.update()
            player.update()

            player.velocity.x = 0

            if (keys.a.pressed && lastKey === 'a') {
                if (player.position.x + player.width + player.velocity.x < 100) {
                    player.velocity.x = 0
                }
                else player.velocity.x = -2
            }
            else if (keys.d.pressed && lastKey === 'd') {
                if (player.position.x + player.width + player.velocity.x >= canvas.width - 10) {
                    player.velocity.x = 0
                }
                else player.velocity.x = 2
            }
        }

        animate()

        function drawFloor() {
            let obstaclesArr = obstacles
            let obstaclesLength = obstacles.length
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

            for (let i = 0; i < obstaclesLength; i++) {
                let fire = obstaclesArr[i]
                fire.update()
            }
        }

        drawFloor()

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
                    if (player.currentJumps < 2) {
                        if (player.currentJumps === 1) player.velocity.y = -6
                        else player.velocity.y = -8
                        player.currentJumps++
                    }
                    break
                case 's':
                    if (player.position.y + player.height + player.velocity.y < canvas.height - 88) {
                        player.velocity.y = 4
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
                    if (player.currentJumps < 2) {
                        if (player.currentJumps === 1) player.velocity.y = -6
                        else player.velocity.y = -8
                        player.currentJumps++
                    }
                    break
                case 'S':
                    if (player.position.y + player.height + player.velocity.y < canvas.height - 88) {
                        player.velocity.y = 4
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
                    if (player.currentJumps < 2) {
                        if (player.currentJumps === 1) player.velocity.y = -6
                        else player.velocity.y = -8
                        player.currentJumps++
                    }
                    break
                case 'ArrowDown':
                    if (player.position.y + player.height + player.velocity.y < canvas.height - 88) {
                        player.velocity.y = 4
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
