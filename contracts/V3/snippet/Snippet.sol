// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../struct/Token.sol";
import "../struct/Task.sol";
import "../interface/IStateCounter.sol";
import "../interface/ISnippet.sol";
import "../interface/IClusterMountingArea.sol";
import "../interface/IClusterAttributeArea.sol";

contract Snippet is ISnippet{


    address clusterArea;
    address stateCounter;

    constructor(address stateCounter_,address clusterArea_){
        stateCounter = stateCounter_;
        clusterArea = clusterArea_;

    }

    function processInitDelayTime(InitDelayParams memory initDelay) public override returns(int32){
        console.log("------------ processInitDelayTime",initDelay.clusterId);
        return 0;
    }

    function processExecuteDelayTime(ExecuteDelayParams memory executeDelay) public override returns(int32){
        console.log("------------ processExecuteDelayTime",executeDelay.clusterId);
        return 0;
    }

    function processInputTokenSlotDelayTime(TokenSlotDelayParams memory tokenSlotDelay) public override returns(int32){
        console.log("------------ processInputTokenSlotDelayTime",tokenSlotDelay.clusterId);
        return 0;
    }

    function processOutputTokenSlotDelayTime(TokenSlotDelayParams memory tokenSlotDelay) public override returns(int32){
        console.log("------------ processOutputTokenSlotDelayTime",tokenSlotDelay.clusterId);
        return 0;
    }

    function preInputToken(PreInputTokenParams memory preInputToken) public override returns(TokenSnippet memory){

        console.log("------------ preInputToken",preInputToken.clusterId);

        TokenSnippet memory tokenSnippet;

        return tokenSnippet;
    }


    function processInputToken(InputTokenParams memory inputToken) public override returns(TokenSnippet memory){

        console.log("------------ processInputToken token",inputToken.inToken.token);
        console.log("------------ processInputToken id",inputToken.inToken.id);
        console.log("------------ processInputToken amount",inputToken.inToken.amount);

        TokenSnippet memory tokenSnippet;

        return tokenSnippet;
    }

    function processOutputToken(OutputTokenParams memory outputToken) public override returns(TokenSnippet memory) {

        console.log("------------ processOutputToken",outputToken.clusterId);

        TokenSnippet memory tokenSnippet;

        return tokenSnippet;
    }

}
