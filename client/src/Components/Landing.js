import React from "react";

import './Landing.css'

import neuralNetworkPic from '../assets/neuralNetwork.png'

function Landing() {
    return (
        <div className="landingContainer">
            <div className="landingHeaderContainer">
                <div className="landingHeaderLeft">
                    <p className="landingHeaderLeftLogo">Bloodborne</p>
                </div>
                <div className="landingHeaderRight">
                    <div className="landingHeaderRightNav">
                        <a className="landingHeaderRightNavLink">Home</a>
                        <a className="landingHeaderRightNavLink">About</a>
                        <a className="landingHeaderRightNavLink">How To Play</a>
                        <button className="landingHeaderRightNavButton">Play</button>
                    </div>
                </div>
            </div>
            <div className="landingBodyContainer">
                <div className="landingBodyHeroContainer">
                    <p className="landingBodyHeroTitle">Spooky, Intelligent...ish, Bloodborne.</p>
                    <button className="landingBodyHeroButton">Play Now</button>
                </div>
                <div className="landingBodyAboutContainer">
                    <div className="landingBodyAboutLeft">
                        <p className="landingBodyAboutLeftTitle">How it works</p>
                        <p className="landingBodyAboutLeftText">etc</p>
                    </div>
                    <div className="landingBodyAboutRight">
                        <p className="landingBodyAboutRightText">Bloodborne's Brain</p>
                        <p className="landingBodyAboutRightText2">13 Input Neurons, 10 Hidden Neurons, 4 Output Neurons</p>
                        <img src={neuralNetworkPic} className="landingBodyAboutRightPic"/>
                    </div>
                </div>
                <div className="landingBodyHowToPlayContainer">

                </div>
            </div>
            <div className="landingFooterContainer">

            </div>
        </div>
    )
}

export default Landing
