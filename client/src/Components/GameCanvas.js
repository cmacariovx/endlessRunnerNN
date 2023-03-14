import React, { useEffect, useRef } from "react";

import background1 from '../assets/OakWoodsLandscape/background/background_layer_1.png'
import background2 from '../assets/OakWoodsLandscape/background/background_layer_2.png'
import background3 from '../assets/OakWoodsLandscape/background/background_layer_3.png'

function GameCanvas() {
    const canvasRef = useRef(null)

    useEffect(() => {
        let canvas = canvasRef.current
        let ctx = canvas.getContext("2d")

        canvas.height = 576
        canvas.width = 1024

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let image1 = new Image()
        image1.src = background1

        let image2 = new Image()
        image2.src = background2

        let image3 = new Image()
        image3.src = background3

        function loadBackgroundImages(callback) {
            let count = 3
            image1.onload = () => {
                count--
                if (count === 0) callback()
            }

            image2.onload = () => {
                count--
                if (count === 0) callback()
            }

            image3.onload = () => {
                count--
                if (count === 0) callback()
            }
        }

        loadBackgroundImages(() => {
            ctx.drawImage(image1, 0, 0, canvas.width, canvas.height)
            ctx.drawImage(image2, 0, 0, canvas.width, canvas.height)
            ctx.drawImage(image3, 0, 0, canvas.width, canvas.height)
        })

        class Sprite {
            constructor(position) {
                this.position = position
            }

            drawPlayer() {
                ctx.fillStyle = 'red'
                ctx.fillRect(this.position.x, this.position.y, 50, 150)
            }
        }

        const player = new Sprite({
            x: 0,
            y: 0
        })

        player.drawPlayer()
    }, [])


    return (
        <div className="gameCanvasContainer">
            <canvas id="gameCanvas" ref={canvasRef}/>
        </div>
    )
}

export default GameCanvas
