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
            constructor(x, y, width, height) {
                this.x = x
                this.y = y
                this.width = width
                this.height = height
                this.velY = 0
                this.velX = 0
                this.onGround = true
                this.hitbox = {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height
                }
            }

            // drawSensors(obstacles) {
            //     const rayLength = 400;
            //     const rayColor = 'yellow';

            //     for (let angle = -45; angle <= 45; angle += 15) {
            //         const radians = angle * (Math.PI / 180);
            //         const endX = this.x + rayLength * Math.cos(radians);
            //         const endY = this.y + this.height / 2 - rayLength * Math.sin(radians);

            //         let closestIntersection = null;
            //         let closestDistance = Infinity;

            //         for (const obstacle of obstacles) {
            //             const intersection = rayObstacleIntersection(this.x, this.y + this.height / 2, endX, endY, obstacle);
            //             if (intersection && intersection.distance < closestDistance) {
            //                 closestDistance = intersection.distance;
            //                 closestIntersection = intersection;
            //             }
            //         }

            //         ctx.strokeStyle = rayColor;
            //         ctx.beginPath();
            //         ctx.moveTo(this.x, this.y + this.height / 2);

            //         if (closestIntersection) {
            //             console.log(closestIntersection)
            //             ctx.lineTo(closestIntersection.x, closestIntersection.y);
            //         } else {
            //             ctx.lineTo(endX, endY);
            //         }

            //         ctx.stroke();
            //     }
            // }

            drawSensors(obstacles) {
                const rayLength = 400;
                const rayColor = 'yellow';
                const rayFill = 'black';

                for (let angle = -45; angle <= 45; angle += 15) {
                    const radians = angle * (Math.PI / 180);
                    const endX = this.x + rayLength * Math.cos(radians);
                    const endY = this.y + this.height / 2 - rayLength * Math.sin(radians);

                    let closestIntersection = null;
                    let closestDistance = Infinity;

                    for (const obstacle of obstacles) {
                        const intersection = rayObstacleIntersection(this.x, this.y + this.height / 2, endX, endY, obstacle);
                        if (intersection && intersection.distance < closestDistance) {
                            closestDistance = intersection.distance;
                            closestIntersection = intersection;
                        }
                    }

                    ctx.strokeStyle = rayColor;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + this.height / 2);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();

                    if (closestIntersection) {
                        ctx.strokeStyle = rayFill;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y + this.height / 2);
                        ctx.lineTo(closestIntersection.x, closestIntersection.y);
                        ctx.stroke();
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'blue';
                ctx.fillRect(this.x, this.y, this.width, this.height)

                // draw hitbox
                ctx.strokeStyle = 'yellow'
                ctx.lineWidth = 2
                ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)
            }

            update() {
                if (!this.onGround) {
                    this.velY += gravity
                }

                this.y += this.velY

                if (this.y + this.height > canvas.height) {
                    this.y = canvas.height - this.height
                    this.velY = 0
                    this.onGround = true
                }
                else this.onGround = false

                // Update hitbox
                this.hitbox.x = this.x;
                this.hitbox.y = this.y;
            }
        }

        function liangBarskyIntersection(x0, y0, x1, y1, left, top, right, bottom) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            const p = [-dx, dx, -dy, dy];
            const q = [x0 - left, right - x0, y0 - top, bottom - y0];
            const u = [0, 1];

            for (let i = 0; i < 4; i++) {
                if (p[i] === 0) {
                    if (q[i] < 0) return null;
                } else {
                    const t = q[i] / p[i];
                    if (p[i] < 0 && u[0] < t) u[0] = t;
                    else if (p[i] > 0 && u[1] > t) u[1] = t;
                    if (u[0] > u[1]) return null;
                }
            }

            return {
                x: x0 + u[0] * dx,
                y: y0 + u[0] * dy,
                distance: Math.sqrt(Math.pow(u[0] * dx, 2) + Math.pow(u[0] * dy, 2)),
            };
        }

        function rayObstacleIntersection(x0, y0, x1, y1, obstacle) {
            const left = obstacle.x;
            const top = obstacle.y;
            const right = obstacle.x + obstacle.width;
            const bottom = obstacle.y + obstacle.height;

            return liangBarskyIntersection(x0, y0, x1, y1, left, top, right, bottom);
        }

        // function rayObstacleIntersection(startX, startY, endX, endY, obstacle) {
        //     const hitbox = obstacle.hitbox;
        //     const denominator = (startX - endX) * (hitbox.y - (hitbox.y + hitbox.height)) - (startY - endY) * (hitbox.x - (hitbox.x + hitbox.width));
        //     if (denominator === 0) return null;

        //     const ua = ((startX - endX) * (startY - hitbox.y) - (startY - endY) * (startX - hitbox.x)) / denominator;
        //     const ub = ((hitbox.x - (hitbox.x + hitbox.width)) * (startY - hitbox.y) - (hitbox.y - (hitbox.y + hitbox.height)) * (startX - hitbox.x)) / denominator;

        //     if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        //         const intersectionX = startX + ua * (endX - startX);
        //         const intersectionY = startY + ua * (endY - startY);
        //         const distance = Math.hypot(intersectionX - startX, intersectionY - startY);
        //         return { x: intersectionX, y: intersectionY, distance };
        //     }
        //     return null;
        // }


        class Obstacle {
            constructor(x, y, width, height) {
                this.x = x
                this.y = y
                this.width = width
                this.height = height
                this.velY = 0
                this.velX = 0
                this.hitbox = {
                    x: this.x,
                    y: this.y,
                    width: this.width,
                    height: this.height
                }
            }

            draw() {
                ctx.fillStyle = 'red'
                ctx.fillRect(this.x, this.y, this.width, this.height)

                // draw hitbox
                ctx.strokeStyle = 'yellow'
                ctx.lineWidth = 2
                ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)
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
                this.hitbox.x = this.x;
                this.hitbox.y = this.y;
            }
        }

        const character = new Character(50, canvas.height - 100, 50, 100)
        const obstacles = []

        function createObstacle() {
            const x = canvas.width
            const y = canvas.height - 50
            const width = 50
            const height = 50
            const obstacle = new Obstacle(x, y, width, height)
            obstacles.push(obstacle)
        }

        function gameLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            background.update()
            character.draw()
            character.drawSensors(obstacles); // Add this line to draw the sensors
            character.update()

            if (obstacles.length === 0 || (obstacles[obstacles.length - 1].x + obstacles[obstacles.length - 1].width) < canvas.width - 300) {
                createObstacle()
            }

            let collisionDetected = false

            for (const [index, obstacle] of obstacles.entries()) {
                obstacle.draw()
                obstacle.update()

                // if (character.x < obstacle.x + obstacle.width &&
                //     character.x + character.width > obstacle.x &&
                //     character.y < obstacle.y + obstacle.height &&
                //     character.y + character.height > obstacle.y) {
                //     // Collision detected
                //     collisionDetected = true
                //     break
                // }

                if (character.hitbox.x < obstacle.hitbox.x + obstacle.hitbox.width &&
                    character.hitbox.x + character.hitbox.width > obstacle.hitbox.x &&
                    character.hitbox.y < obstacle.hitbox.y + obstacle.hitbox.height &&
                    character.hitbox.y + character.hitbox.height > obstacle.hitbox.y) {
                    // Collision detected
                    collisionDetected = true;
                    break;
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

    //     class Sprite {
    //         constructor({ position, velocity, imageSrc, scale = 1, framesMax = 1 }) {
    //             this.position = position
    //             this.velocity = velocity
    //             this.height = 100
    //             this.width = 100
    //             this.image = new Image()
    //             this.image.src = imageSrc
    //             this.isOnGround = true
    //             this.currentJumps = 0
    //             this.scale = scale
    //             this.framesMax = framesMax
    //             this.framesCurrent = 0
    //             this.framesElapsed = 0
    //             this.framesHold = 12
    //             this.hitbox = {
    //                 position: this.position,
    //                 height: 100,
    //                 width: 74
    //             }
    //             this.sensor = new Sensor(this)
    //         }

    //         drawPlayer() {
    //             ctx.drawImage(
    //                 this.image,
    //                 this.framesCurrent * (this.image.width / this.framesMax),
    //                 0,
    //                 this.image.width / this.framesMax,
    //                 this.image.height,
    //                 this.position.x,
    //                 this.position.y,
    //                 (this.image.width / this.framesMax) * this.scale,
    //                 this.image.height * this.scale
    //             )
    //             this.sensor.draw()
    //             ctx.beginPath()
    //             ctx.strokeStyle = 'red'
    //             ctx.rect(this.hitbox.position.x + 34, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)
    //             ctx.stroke()
    //         }

    //         update(obstacles) {
    //             this.sensor.update(obstacles)
    //             this.drawPlayer()
    //             this.framesElapsed++

    //             if (this.framesElapsed % this.framesHold === 0) {
    //                 if (this.framesCurrent < this.framesMax - 1) {
    //                     this.framesCurrent++
    //                 }
    //                 else {
    //                     this.framesCurrent = 0
    //                 }
    //             }

    //             if (this.velocity.y === 0) {
    //                 this.isOnGround = true
    //                 this.currentJumps = 0
    //             }
    //             else this.isOnGround = false

    //             this.position.x += this.velocity.x
    //             this.position.y += this.velocity.y

    //             this.hitbox.position.x = this.position.x
    //             this.hitbox.position.y = this.position.y

    //             if (this.position.y + this.height + this.velocity.y >= canvas.height - 88) {
    //                 this.velocity.y = 0
    //             }
    //             else {
    //                 this.velocity.y += gravity
    //             }
    //         }
    //     }

    //     let obstacles = []
    //     let obstacleId = 0

    //     class Obstacle {
    //         constructor({ position, velocity, imageSrc, scale = 1, framesMax = 1 }) {
    //             this.position = position
    //             this.velocity = velocity
    //             this.height = 150
    //             this.width = 50
    //             this.image = new Image()
    //             this.image.src = imageSrc
    //             this.obstacleId = obstacleId + 1
    //             this.scale = scale
    //             this.framesMax = framesMax
    //             this.framesCurrent = 0
    //             this.framesElapsed = 0
    //             this.framesHold = 15
    //             this.hitbox = {
    //                 position: this.position,
    //                 height: 50,
    //                 width: 34
    //             }

    //             const topLeft = {x: this.position.x, y: this.position.y}
    //             const topRight = {x: this.position.x + this.hitbox.width, y: this.position.y}
    //             const bottomLeft = {x: this.position.x, y: this.position.y + this.hitbox.height}
    //             const bottomRight = {x: this.position.x + this.hitbox.width, y: this.position.y + this.hitbox.height}

    //             this.borders = [
    //                 [topLeft, bottomLeft],
    //                 [topRight, bottomRight],
    //                 [topLeft, topRight],
    //                 [bottomLeft, bottomRight]
    //             ]
    //         }

    //         draw() {
    //             ctx.drawImage(
    //                 this.image,
    //                 this.framesCurrent * (this.image.width / this.framesMax),
    //                 0,
    //                 this.image.width / this.framesMax,
    //                 this.image.height,
    //                 this.position.x,
    //                 this.position.y,
    //                 (this.image.width / this.framesMax) * this.scale,
    //                 this.image.height * this.scale
    //                 )
    //                 ctx.beginPath()
    //                 ctx.strokeStyle = 'red'
    //                 ctx.rect(this.hitbox.position.x + 8, this.hitbox.position.y + 20, this.hitbox.width, this.hitbox.height)
    //                 ctx.stroke()
    //         }

    //         update() {
    //             this.position.x += this.velocity.x

    //             this.hitbox.position.x = this.position.x
    //             this.hitbox.position.y = this.position.y

    //             if (this.position.x < -40) {
    //                 for (let i = 0; i < obstacles.length; i++) {
    //                     let obstacle = obstacles[i]
    //                     if (obstacle.obstacleId === this.obstacleId) {
    //                         obstacles.splice(i, 1)
    //                         spawnObstacle()
    //                     }
    //                 }
    //             }

    //             this.draw()
    //             this.framesElapsed++

    //             if (this.framesElapsed % this.framesHold === 0) {
    //                 if (this.framesCurrent < this.framesMax - 1) {
    //                     this.framesCurrent++
    //                 }
    //                 else {
    //                     this.framesCurrent = 0
    //                 }
    //             }
    //         }
    //     }

    //     function lerp(A, B, t) {
    //         return A + (B - A) * t
    //     }

    //     function getIntersection(A, B, C, D) {
    //         const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
    //         const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
    //         const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)

    //         if (bottom != 0) {
    //             const t = tTop / bottom
    //             const u = uTop / bottom

    //             if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    //                 return {
    //                     x: lerp(A.x, B.x, t),
    //                     y: lerp(A.y, B.y, t),
    //                     offset: t
    //                 }
    //             }
    //         }

    //         return null
    //     }

    //     class Sensor {
    //         constructor(player) {
    //             this.player = player
    //             this.rayCount = 5
    //             this.rayLength = 250
    //             this.raySpread = Math.PI / 8
    //             this.rays = []
    //             this.readings = []
    //         }

    //         update(obstacles) {
    //             this.castRays()
    //             this.readings = []

    //             for (let i = 0; i < obstacles.length; i++) {
    //                 let obstacle = obstacles[i]
    //                 let borders = obstacle.borders
    //                 for (let j = 0; j < this.rays.length; j++) {
    //                     this.readings.push(this.getReading(this.rays[j], borders))
    //                 }
    //             }
    //         }

    //         getReading(ray, borders) {
    //             let touches = []

    //             for (let i = 0; i < borders.length; i++){
    //                 const touch = getIntersection(ray[0], ray[1], borders[i][0], borders[i][1])
    //                 if (touch) {
    //                     touches.push(touch)
    //                 }
    //             }

    //             if (!touches.length) {
    //                 return null
    //             }
    //             else {
    //                 const offsets = touches.map(e => e.offset)
    //                 const minOffset = Math.min(...offsets)

    //                 return touches.find(e => e.offset === minOffset)
    //             }
    //         }

    //         castRays() {
    //             this.rays = []

    //             for (let i = 0; i < this.rayCount; i++) {
    //                 const rayAngle = lerp(
    //                     this.raySpread / 2,
    //                     -this.raySpread / 2,
    //                     i / (this.rayCount - 1)
    //                 )

    //                 const start = {
    //                     x: this.player.position.x + 70,
    //                     y: this.player.position.y + 50
    //                 }
    //                 const end = {
    //                     x: (this.player.position.x + 70) + Math.cos(rayAngle) * this.rayLength,
    //                     y: (this.player.position.y + 50) - Math.sin(rayAngle) * this.rayLength
    //                 }

    //                 this.rays.push([start, end])
    //             }
    //         }

    //         draw() {
    //             for (let i = 0; i < this.rayCount; i++) {
    //                 let end = this.rays[i][1]

    //                 if (this.readings[i]) {
    //                     end = this.readings[i]
    //                 }

    //                 ctx.beginPath()
    //                 ctx.lineWidth = 2
    //                 ctx.strokeStyle = 'yellow'
    //                 ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
    //                 ctx.lineTo(end.x, end.y)
    //                 ctx.stroke()

    //                 ctx.beginPath()
    //                 ctx.lineWidth = 2
    //                 ctx.strokeStyle = 'black'
    //                 ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
    //                 ctx.lineTo(end.x, end.y)
    //                 ctx.stroke()
    //             }
    //         }
    //     }

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

    //     const player = new Sprite({
    //         position: {
    //             x: 0,
    //             y: 0
    //         },
    //         velocity: {
    //             x: 0,
    //             y: 0
    //         },
    //         imageSrc: fullIdle,
    //         scale: 1,
    //         framesMax: 9
    //     })

    //     let maxStartObstacles = 5

    //     function spawnInitialObstacles() {
    //         for (let i = 0; i < maxStartObstacles; i++) {
    //             spawnObstacle()
    //         }
    //     }

    //     spawnInitialObstacles()

    //     function spawnObstacle() {
    //         let obstacleX = (Math.floor(Math.random() * canvas.width)) + canvas.width

    //         if (obstacles.length) {
    //             let lastObstacleX = obstacles[obstacles.length - 1].position.x

    //             while (obstacleX - lastObstacleX < 200 && obstacleX - lastObstacleX > 100) {
    //                 obstacleX += 100
    //             }
    //         }

    //         obstacles.push(new Obstacle({
    //             position: {
    //                 x: obstacleX,
    //                 y: 424
    //             },
    //             velocity: {
    //                 x: -1.4,
    //                 y: 0
    //             },
    //             imageSrc: fire,
    //             scale: 2,
    //             framesMax: 8
    //         }))

    //         obstacleId++
    //     }

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

    //     function animate() {
    //         window.requestAnimationFrame(animate)
    //         ctx.fillStyle = 'black'
    //         ctx.fillRect(0, 0, canvas.width, canvas.height)
    //         background.update()
    //         player.update(obstacles)

    //         for (let i = 0; i < obstacles.length; i++) {
    //             let fire = obstacles[i]
    //             fire.update()

    //             // checkCollisions(fire)
    //         }

    //         player.velocity.x = 0

    //         if (keys.a.pressed && lastKey === 'a') {
    //             if (player.position.x + player.width + player.velocity.x < 100) {
    //                 player.velocity.x = 0
    //             }
    //             else player.velocity.x = -2
    //         }
    //         else if (keys.d.pressed && lastKey === 'd') {
    //             if (player.position.x + player.width + player.velocity.x >= canvas.width - 10) {
    //                 player.velocity.x = 0
    //             }
    //             else player.velocity.x = 2
    //         }


    //         function checkCollisions(fire) {
    //             let playerLeft = player.hitbox.position.x
    //             let playerRight = player.hitbox.position.x + player.hitbox.width
    //             let playerTop = player.hitbox.position.y
    //             let playerBottom = player.hitbox.position.y + player.hitbox.height

    //             let obstacleLeft = fire.hitbox.position.x
    //             let obstacleRight = fire.hitbox.position.x + fire.hitbox.width
    //             let obstacleTop = fire.hitbox.position.y
    //             let obstacleBottom = fire.hitbox.position.y + fire.hitbox.height

    //             if ((playerRight >= obstacleLeft && playerRight <= obstacleRight)) {
    //                 console.log("hit", fire.obstacleId)
    //             }
    //         }
    //     }

    //     animate()

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
