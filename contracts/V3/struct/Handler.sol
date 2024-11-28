// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";
import "../interface/IHandler.sol";
import "./Task.sol";

library Handler {

    using Task for Task.Task;

    struct Pre {
        address caller;
        address poolTokenInput;
        address clusterArea;
        address stateCounter;
        uint32 clusterId;
        uint16 ruleSlotIndexInput;
        uint16 ruleSlotIndexOutput;
        uint8 groupInputBranch;
        uint32 multiple;
        Token.Token[] inTokenList;
        bytes args;
    }

    struct Process {
        address caller;
        address stateCounter;
        address poolFee;
        Task.Task task;
        uint8 state;
    }

    struct Result {
        address handler;
        uint8 code;
        string msg;
        bytes args;//pass to next handler
    }

    struct StateParams {
        address engine;
        address clusterArea;
        uint32 clusterId;
        uint16 ruleSlotIndexInput;
        uint16 ruleSlotIndexOutput;
        uint8 branch;
        address stateCounter;
        uint32 taskId;
        address caller;
        uint8 cmd;
        bytes args;
    }


    function makeEngineClusterRuleTaskHash(address engine, Process memory param) internal returns (bytes32) {
        // engine + clusterArea + clusterId + ruleSlotIndexInput + ruleSlotIndexOutput + taskId =>
        bytes32 engineClusterRuleAreaHash = keccak256(abi.encode(engine, param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput(), param.stateCounter, param.task.taskId));
        return engineClusterRuleAreaHash;
    }

    function makeEngineClusterRuleHash(address engine, Process memory param) internal returns (bytes32) {
        // engine + clusterArea + clusterId + ruleSlotIndexInput + ruleSlotIndexOutput
        bytes32 engineClusterRuleAreaHash = keccak256(abi.encode(engine, param.task.clusterArea, param.task.clusterId, param.task.getRuleSlotIndexInput(), param.task.getRuleSlotIndexOutput()));
        return engineClusterRuleAreaHash;
    }

    function makeEngineClusterTaskHash(address engine, IHandler.Claim memory claim) internal returns (bytes32) {
        // engine + clusterArea + clusterId + stateCounter + taskId =>
        bytes32 engineClusterTaskHash = keccak256(abi.encode(msg.sender, claim.clusterArea, claim.clusterId, claim.stateCounter, claim.taskId));
        return engineClusterTaskHash;
    }

    function makeEngineClusterTaskCallerHash(
        address engine,
        address clusterArea,
        uint32 clusterId,
        address stateCounter,
        uint32 taskId,
        address caller) internal pure returns (bytes32){
        bytes32 hash = keccak256(abi.encode(engine, clusterArea, clusterId, stateCounter, taskId, caller));
        return hash;
    }

    function makeEngineClusterTaskCallerRoundHash(
        address engine,
        address clusterArea,
        uint32 clusterId,
        address stateCounter,
        uint32 taskId,
        address caller,
        uint16 round) internal pure returns (bytes32){
        bytes32 hash = keccak256(abi.encode(engine, clusterArea, clusterId, stateCounter, taskId, caller, round));
        return hash;
    }

}
