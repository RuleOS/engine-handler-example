// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IClusterArea.sol";
import "../struct/Cluster.sol";
import "../struct/Handler.sol";
import "../struct/Token.sol";
import "../struct/Constant.sol";
import "../struct/TokenHandler.sol";
import "./IVersion.sol";

interface IHandler is IVersion {

    struct IOBranch {
        uint8[] inBranch;
        uint8[] outBranch;
    }

    struct Claim {
        address engine;
        address clusterArea;
        address stateCounter;
        uint32 clusterId;
        uint32 taskId;
        address claimer;
        uint8 io;
        uint16 round;
        uint8 branch;
        uint8 tokenSlotIndex;
    }

    function getIOBranches() external pure returns (IOBranch[] memory);

    function setEngineAreaList(address[] memory engineAreaList) external;

    function getEngineAreaList(string[] memory areaNameList) external returns (address[] memory);

    function getState(Handler.StateParams memory params) external view returns(bytes[] memory);

    function regRule(uint32 clusterId, Cluster.Cluster memory cluster) external;

    function regRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch, bytes memory args) external;

    function getRuleGroupSlotArgs(uint32 clusterId, uint16 ruleSlotIndex, uint8 branch) external view returns (bytes memory);

    function updateArgs(uint32 clusterId, uint16 ruleSlotIndexInput, uint16 ruleSlotIndexOutput, uint8 cmd, bytes memory args) external returns (bool);

    function process(
        Handler.Process memory param,
        Handler.Result memory preResult
    ) external returns (Handler.Result memory res);

    //get io addressList of each round
    function getInputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) external view returns (address[] memory);

    function getOutputAddressRound(address engine, address clusterArea, uint32 clusterId, address stateCounter, uint32 taskId, uint16 round) external view returns (address[] memory);

    function getTokenBranch(
        address engine,
        address outAddress,
        address clusterArea,
        uint32 clusterId,
        address stateCounter,
        uint32 taskId,
        bytes memory args,
        uint16 round
    ) external view returns (TokenHandler.TokenBranch memory);

    //get claim state of every token of input and output
    function getClaimIOAddressBranchToken(Claim memory claim) external view returns (bool);

    function claimIOAddressBranchToken(Claim memory claim) external returns (bool);

}
