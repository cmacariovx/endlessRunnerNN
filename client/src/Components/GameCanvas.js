import React, { useEffect, useRef } from "react";

import backgroundMain from '../assets/parallax_demon_woods_pack/parallax_demon_woods_pack/layers/demonwoods.png'
import floor1 from '../assets/OakWoodsLandscape/decorations/floor1.png'
import floor2 from '../assets/OakWoodsLandscape/decorations/floor8.png'

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
            constructor({ position, velocity }) {
                this.position = position
                this.velocity = velocity
                this.height = 150
            }

            drawPlayer() {
                ctx.fillStyle = 'red'
                ctx.fillRect(this.position.x, this.position.y, 50, this.height)
            }

            update() {
                this.drawPlayer()
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
            }
        })

        const background = new Background({
            position: {
                x: 0,
                y: 0
            },
            imageSrc: backgroundMain
        })

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
                player.velocity.x = -2
            }
            else if (keys.d.pressed && lastKey === 'd') {
                player.velocity.x = 2
            }
        }

        animate()

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
                case 'A':
                    keys.a.pressed = true
                    lastKey = 'a'
                    break
                case 'D':
                    keys.d.pressed = true
                    lastKey = 'd'
                    break
                case ' ':
                    player.velocity.y = -10
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
                    player.velocity.y = -10
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
